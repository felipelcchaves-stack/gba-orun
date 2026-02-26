/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme a troca de e-mail — Gbá Orun</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={mascot}>🦎</Text>
        <Heading style={h1}>Troca de e-mail</Heading>
        <Text style={text}>
          Você pediu para trocar seu e-mail no Gbá Orun de{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          para{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>
          Clique no botão abaixo para confirmar:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar Troca
        </Button>
        <Text style={footer}>
          Se você não pediu esta troca, proteja sua conta imediatamente.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '480px', margin: '0 auto' }
const mascot = { fontSize: '40px', textAlign: 'center' as const, margin: '0 0 8px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#3D3128',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '14px',
  color: '#8C8279',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: '#733D1F', textDecoration: 'underline' }
const button = {
  backgroundColor: '#733D1F',
  color: '#FFFBF0',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'block' as const,
  textAlign: 'center' as const,
}
const footer = { fontSize: '12px', color: '#aaa', margin: '30px 0 0' }
