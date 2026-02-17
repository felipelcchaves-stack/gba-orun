import { useEffect } from "react";
import { ExternalLink, CheckCircle, Star, Shield, BookOpen, Compass, Headphones, Zap, Eye, Heart, HelpCircle, ChevronRight } from "lucide-react";
import { trackInitiateCheckout } from "@/lib/pixel";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useActivePlans } from "@/hooks/useSubscriptionPlans";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const testimonials = [
  { name: "Maria S.", text: "Nunca mais tive dúvida no Obi. Esse app mudou minha vida espiritual!", stars: 5 },
  { name: "João P.", text: "As receitas de Ebo são completas e fiéis à tradição. Recomendo demais!", stars: 5 },
  { name: "Ana L.", text: "Uso todos os dias no meu terreiro. Os Orikis são perfeitos.", stars: 5 },
  { name: "Carlos M.", text: "A praticidade de ter tudo no celular é incrível. Mudou minha rotina espiritual.", stars: 5 },
];

const faqs = [
  { q: "Preciso ter experiência religiosa para usar?", a: "Não! O Gba-Orun foi criado tanto para iniciantes quanto para praticantes experientes. O conteúdo é didático e acessível." },
  { q: "Funciona no celular?", a: "Sim! O app é 100% responsivo e pode ser instalado como aplicativo no seu celular, sem precisar da App Store." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim! Você pode cancelar sua assinatura quando quiser, sem burocracia. Seu acesso continua até o fim do período pago." },
  { q: "Posso usar offline?", a: "Após instalar o app, as páginas já visitadas ficam disponíveis offline. Novos conteúdos precisam de conexão para carregar pela primeira vez." },
  { q: "Como funciona a garantia?", a: "Se por qualquer motivo não ficar satisfeito, basta solicitar o reembolso dentro do prazo de garantia. Sem perguntas." },
];

const pains = [
  "Fica inseguro(a) na hora de interpretar o Obi?",
  "Não sabe qual Ebo preparar para cada situação?",
  "Depende de outras pessoas para consultas simples?",
  "Perde tempo procurando Orikis em livros e cadernos espalhados?",
];

const PERIOD_LABELS: Record<string, string> = {
  monthly: "/mês",
  quarterly: "/trimestre",
  yearly: "/ano",
};

const OfertaPage = () => {
  const { data: settings } = useAppSettings();
  const { data: plans } = useActivePlans();

  const mainPlan = plans?.[0];
  const checkoutUrl = mainPlan?.guru_checkout_url || settings?.checkout_url || "#";
  const price = mainPlan ? Number(mainPlan.price).toFixed(2).replace(".", ",") : (settings?.offer_price || "29,90");
  const periodLabel = mainPlan ? (PERIOD_LABELS[mainPlan.billing_period] || "/mês") : "/mês";
  const headline = settings?.offer_headline || "Descubra o que o Orixá quer de você agora.";
  const videoUrl = settings?.offer_video_url || "";
  const ctaText = settings?.offer_cta_text || "Quero Começar Agora";
  const urgencyText = settings?.offer_urgency_text || "🔥 Oferta por tempo limitado!";
  const guaranteeDays = settings?.offer_guarantee_days || "7";

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Gba-Orun — Sabedoria Ancestral Yorubá",
      description: "O guia digital mais completo de Obi, Rituais e Orikis da tradição Yorubá.",
      offers: {
        "@type": "Offer",
        price: mainPlan?.price || price,
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: String(testimonials.length),
      },
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [price, mainPlan]);

  const handleCheckout = (url?: string) => {
    trackInitiateCheckout();
    const targetUrl = url || checkoutUrl;
    if (targetUrl && targetUrl !== "#") window.open(targetUrl, "_blank");
  };

  const CTAButton = ({ full = false, url }: { full?: boolean; url?: string }) => (
    <button
      onClick={() => handleCheckout(url)}
      className={`${full ? "w-full" : ""} bg-accent text-accent-foreground px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-gold inline-flex items-center justify-center gap-2 shadow-gold`}
    >
      {ctaText} <ChevronRight className="h-5 w-5" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Urgency Bar */}
      <div className="bg-accent text-accent-foreground text-center py-2.5 px-4 text-sm font-semibold sticky top-0 z-50">
        {urgencyText}
      </div>

      {/* Hero */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Assinatura Mensal
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-5 leading-tight text-foreground">
            {headline}
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            O guia digital mais completo de Obi, Rituais e Orikis da tradição Yorubá. Tudo na palma da sua mão.
          </p>

          {/* Plan cards */}
          {plans && plans.length > 1 ? (
            <div className="grid gap-4 sm:grid-cols-2 mb-8 max-w-lg mx-auto">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-card rounded-2xl p-6 border border-border shadow-soft text-center">
                  <h3 className="font-display font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                    <span className="text-sm font-normal text-muted-foreground">{PERIOD_LABELS[plan.billing_period] || "/mês"}</span>
                  </div>
                  {plan.description && <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>}
                  <button
                    onClick={() => handleCheckout(plan.guru_checkout_url || undefined)}
                    className="w-full bg-accent text-accent-foreground py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Assinar {plan.name}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-3 mb-6">
                <span className="text-5xl font-display font-bold text-foreground">R$ {price}</span>
                <span className="text-base text-muted-foreground">{periodLabel}</span>
              </div>
              <CTAButton />
              <p className="text-xs text-muted-foreground mt-4">Pagamento seguro • Cancele quando quiser</p>
            </>
          )}
        </div>
      </section>

      {/* VSL */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {videoUrl ? (
            <div className="aspect-video rounded-2xl overflow-hidden bg-card shadow-card">
              <iframe src={videoUrl} className="w-full h-full" allowFullScreen allow="autoplay" title="Vídeo de apresentação" />
            </div>
          ) : (
            <div className="aspect-video bg-card rounded-2xl shadow-card flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Vídeo de apresentação</p>
            </div>
          )}
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 px-6 bg-card">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-3 text-foreground">Você já passou por isso?</h2>
          <p className="text-muted-foreground mb-10">Se identificou com alguma dessas situações, o Gba-Orun foi feito para você.</p>
          <div className="grid gap-4 text-left">
            {pains.map((pain, i) => (
              <div key={i} className="flex items-start gap-3 bg-background rounded-xl p-4 shadow-soft">
                <HelpCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <span className="text-foreground font-medium">{pain}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-accent text-sm font-bold uppercase tracking-wider">A Solução</span>
          <h2 className="text-3xl font-display font-bold mt-2 mb-4 text-foreground">Conheça o Gba-Orun</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
            Um app completo que reúne o Oráculo do Obi, receitas de Ebo, Orikis, rituais de proteção e muito mais — tudo organizado, acessível e fiel à tradição Yorubá.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Eye, label: "Oráculo Interativo" },
              { icon: BookOpen, label: "Rituais Completos" },
              { icon: Heart, label: "Cuidado Espiritual" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card shadow-soft">
                <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 bg-card">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-10 text-foreground">O que você vai receber</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Compass, title: "Oráculo do Obi", desc: "Interprete cada caída com precisão e confiança." },
              { icon: BookOpen, title: "Receitas de Ebo", desc: "Ebós completos com materiais, cantigas e procedimentos." },
              { icon: Headphones, title: "Áudios Exclusivos", desc: "Áudios gravados para guiar sua prática ritual." },
              { icon: Shield, title: "Proteção de Iyami", desc: "Rituais de proteção e cuidado espiritual ancestral." },
              { icon: Zap, title: "Jornada Gamificada", desc: "Acompanhe seu progresso espiritual com XP e conquistas." },
              { icon: Star, title: "Atualizações Contínuas", desc: "Novos conteúdos e funcionalidades inclusos na assinatura." },
            ].map((b, i) => (
              <div key={i} className="bg-background rounded-2xl p-6 shadow-soft">
                <b.icon className="h-6 w-6 text-accent mb-3" strokeWidth={1.5} />
                <h3 className="font-display font-bold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-10 text-foreground">Como funciona</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "Assine", desc: "Escolha seu plano e crie sua conta em segundos." },
              { step: "2", title: "Consulte", desc: "Use o Oráculo do Obi e descubra o caminho." },
              { step: "3", title: "Pratique", desc: "Siga os rituais indicados e evolua espiritualmente." },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-display font-bold text-lg">
                  {s.step}
                </div>
                <h3 className="font-display font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-card">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-10 text-foreground">O que dizem nossos alunos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-background rounded-2xl p-6 shadow-soft">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm mb-3 leading-relaxed italic text-muted-foreground">"{t.text}"</p>
                <span className="text-xs font-bold text-foreground">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-10 text-foreground">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-2xl px-5 border-none shadow-soft">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 px-6 bg-card">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-accent" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3 text-foreground">Garantia de {guaranteeDays} dias</h2>
          <p className="text-muted-foreground leading-relaxed">
            Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro em até {guaranteeDays} dias. Sem perguntas, sem burocracia.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Pronto para transformar sua prática?</h2>
          <p className="text-muted-foreground text-sm mb-8">Acesso imediato a todo o conteúdo. Cancele quando quiser. Garantia total.</p>
          <div className="flex items-baseline justify-center gap-3 mb-6">
            <span className="text-5xl font-display font-bold text-foreground">R$ {price}</span>
            <span className="text-base text-muted-foreground">{periodLabel}</span>
          </div>
          <CTAButton full />
          <p className="text-xs text-muted-foreground mt-4">Pagamento seguro via cartão, Pix ou boleto</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Gba-Orun — Sabedoria Ancestral Yorubá</p>
          <p>Este produto não substitui orientação religiosa presencial.</p>
          <p>© {new Date().getFullYear()} Gba-Orun. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default OfertaPage;
