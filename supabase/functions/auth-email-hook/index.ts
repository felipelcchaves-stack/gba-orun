import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirme seu e-mail — Gbá Orun',
  invite: 'Você foi convidado(a) — Gbá Orun',
  magiclink: 'Seu link de acesso — Gbá Orun',
  recovery: 'Redefinir sua senha — Gbá Orun',
  email_change: 'Confirme a troca de e-mail — Gbá Orun',
  reauthentication: 'Seu código de verificação — Gbá Orun',
}

// Template mapping
const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

// Configuration
const SITE_NAME = 'Gbá Orun'
const ROOT_DOMAIN = 'gba-orun.ifatokun.com.br'
// Domain shown in the From address — must be verified (SPF/DKIM/DMARC) in Resend.
const FROM_DOMAIN = 'gba-orun.ifatokun.com.br'

const PREVIEW_AUTH_TOKEN = Deno.env.get('PREVIEW_AUTH_TOKEN')
const hookSecretRaw = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? ''
const hookSecret = hookSecretRaw.replace('v1,whsec_', '')
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

// Sample data for preview mode ONLY (not used in actual email sending).
const SAMPLE_EMAIL = 'user@example.test'
const SAMPLE_URL = `https://${ROOT_DOMAIN}`
const SAMPLE_DATA: Record<string, object> = {
  signup: { siteName: SITE_NAME, siteUrl: SAMPLE_URL, recipient: SAMPLE_EMAIL, confirmationUrl: SAMPLE_URL },
  magiclink: { siteName: SITE_NAME, confirmationUrl: SAMPLE_URL },
  recovery: { siteName: SITE_NAME, confirmationUrl: SAMPLE_URL },
  invite: { siteName: SITE_NAME, siteUrl: SAMPLE_URL, confirmationUrl: SAMPLE_URL },
  email_change: { siteName: SITE_NAME, email: SAMPLE_EMAIL, newEmail: SAMPLE_EMAIL, confirmationUrl: SAMPLE_URL },
  reauthentication: { token: '123456' },
}

// Preview endpoint handler - returns rendered HTML without sending email
async function handlePreview(req: Request): Promise<Response> {
  const previewCorsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: previewCorsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!PREVIEW_AUTH_TOKEN || authHeader !== `Bearer ${PREVIEW_AUTH_TOKEN}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let type: string
  try {
    const body = await req.json()
    type = body.type
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const EmailTemplate = EMAIL_TEMPLATES[type]
  if (!EmailTemplate) {
    return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sampleData = SAMPLE_DATA[type] || {}
  const html = await renderAsync(React.createElement(EmailTemplate, sampleData))

  return new Response(html, {
    status: 200,
    headers: { ...previewCorsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// Webhook handler - verifies Supabase's native Send Email Hook signature and sends via Resend
async function handleWebhook(req: Request): Promise<Response> {
  if (!hookSecretRaw) {
    console.error('SEND_EMAIL_HOOK_SECRET not configured')
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const payloadText = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)

  let verified: {
    user: { email: string }
    email_data: {
      token: string
      token_hash: string
      redirect_to: string
      email_action_type: string
      email_new?: string
    }
  }
  try {
    verified = wh.verify(payloadText, headers) as typeof verified
  } catch (error) {
    console.error('Invalid webhook signature', error)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { user, email_data } = verified
  const { token, token_hash, redirect_to, email_action_type, email_new } = email_data

  console.log('Received auth event', { emailType: email_action_type, email: user.email })

  const EmailTemplate = EMAIL_TEMPLATES[email_action_type]
  if (!EmailTemplate) {
    console.error('Unknown email type', { email_action_type })
    return new Response(
      JSON.stringify({ error: `Unknown email type: ${email_action_type}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const confirmationUrl =
    `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  // Build template props (same shape the templates already expect)
  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: `https://${ROOT_DOMAIN}`,
    recipient: user.email,
    confirmationUrl,
    token,
    email: user.email,
    newEmail: email_new,
  }

  // Render React Email to HTML and plain text
  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
    plainText: true,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      to: [user.email],
      subject: EMAIL_SUBJECTS[email_action_type] || 'Notificação',
      html,
      text,
    })
    if (error) throw error

    console.log('Email sent successfully', { message_id: data?.id })
    return new Response(
      JSON.stringify({ success: true, message_id: data?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Resend send error', error)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Handle CORS preflight for main endpoint
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Route to preview handler for /preview path
  if (url.pathname.endsWith('/preview')) {
    return handlePreview(req)
  }

  // Main webhook handler
  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
