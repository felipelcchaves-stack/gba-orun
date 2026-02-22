import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, Shield, BookOpen, Compass, Headphones, Zap, Star, Heart, HelpCircle, ChevronRight, Play } from "lucide-react";
import { trackInitiateCheckout, trackViewContent, trackAddToCart } from "@/lib/pixel";
import { sendCAPIEvent } from "@/lib/capi";
import { appendUtmsToUrl } from "@/lib/utm";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useAuth } from "@/hooks/useAuth";
import { useActivePlans } from "@/hooks/useSubscriptionPlans";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePublicReviews } from "@/hooks/usePublicReviews";
import AuthoritySection from "@/components/landing/AuthoritySection";
import PhoneMockup, { HomeMockupContent, OracleMockupContent, RitualsMockupContent, JourneyMockupContent, LearnMockupContent } from "@/components/landing/PhoneMockup";

const FALLBACK_TESTIMONIALS = [
{ name: "Maria S.", text: "Nunca mais tive dúvida no Obi. Esse app mudou minha vida espiritual!", stars: 5 },
{ name: "João P.", text: "As receitas de Ebo são completas e fiéis à tradição. Recomendo demais!", stars: 5 },
{ name: "Ana L.", text: "Uso todos os dias no meu terreiro. Os Orikis são perfeitos.", stars: 5 },
{ name: "Carlos M.", text: "A praticidade de ter tudo no celular é incrível. Mudou minha rotina espiritual.", stars: 5 }];


const faqs = [
{ q: "O que é o Método Oluwo Ifatokun?", a: "É uma metodologia ritualística desenvolvida pelo Oluwo Ifatokun, sacerdote de Ifá, que organiza e sistematiza os procedimentos sagrados da tradição Yorubá. O Gba-Orun é a versão digital desta sabedoria ancestral." },
{ q: "Preciso ter experiência religiosa para usar?", a: "Não! O Gba-Orun foi criado tanto para iniciantes quanto para praticantes experientes. O conteúdo é didático e acessível." },
{ q: "Funciona no celular?", a: "Sim! O app é 100% responsivo e pode ser instalado como aplicativo no seu celular, sem precisar da App Store." },
{ q: "Posso cancelar a qualquer momento?", a: "Sim! Você pode cancelar sua assinatura quando quiser, sem burocracia. Seu acesso continua até o fim do período pago." },
{ q: "Posso usar offline?", a: "Após instalar o app, as páginas já visitadas ficam disponíveis offline. Novos conteúdos precisam de conexão para carregar pela primeira vez." },
{ q: "Como funciona a garantia?", a: "Se por qualquer motivo não ficar satisfeito, basta solicitar o reembolso dentro do prazo de garantia. Sem perguntas." }];


const pains = [
"Fica inseguro(a) na hora de interpretar o Obi?",
"Não sabe qual Ebo preparar para cada situação?",
"Depende de outras pessoas para consultas simples?",
"Perde tempo procurando Orikis em livros e cadernos espalhados?"];


const PERIOD_LABELS: Record<string, string> = {
  monthly: "/mês",
  quarterly: "/trimestre",
  yearly: "/ano"
};

const OfertaPage = () => {
  const { data: settings } = useAppSettings();
  const { data: plans } = useActivePlans();
  const { data: realReviews } = usePublicReviews();
  const navigate = useNavigate();
  const { user } = useAuth();

  const realTestimonials = (realReviews || []).map((r) => ({
    name: r.display_name,
    text: r.review_text,
    stars: r.rating
  }));
  const testimonials = realTestimonials.length >= 4 ?
  realTestimonials :
  [...realTestimonials, ...FALLBACK_TESTIMONIALS.slice(0, Math.max(0, 4 - realTestimonials.length))];

  const mainPlan = plans?.[0];
  const checkoutUrl = mainPlan?.guru_checkout_url || settings?.checkout_url || "#";
  const price = mainPlan ? Number(mainPlan.price).toFixed(2).replace(".", ",") : settings?.offer_price || "29,90";
  const periodLabel = mainPlan ? PERIOD_LABELS[mainPlan.billing_period] || "/mês" : "/mês";
  const headline = settings?.offer_headline || "Descubra o que o Òrìṣà quer de você agora.";
  const ctaText = settings?.offer_cta_text || "Quero Começar Agora";
  const urgencyText = settings?.offer_urgency_text || "🔥 Oferta por tempo limitado!";
  const guaranteeDays = settings?.offer_guarantee_days || "7";

  // ViewContent on mount
  useEffect(() => {
    const eventId = trackViewContent({ content_name: "Landing Page", content_category: "oferta" });
    if (user?.email) sendCAPIEvent("ViewContent", user.email, { event_id: eventId, custom_data: { content_name: "Landing Page" } });
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Gba-Orun — Sabedoria Ancestral Yorubá",
      description: "O guia digital mais completo de Obi, Rituais e Orikis da tradição Yorubá.",
      offers: { "@type": "Offer", price: mainPlan?.price || price, priceCurrency: "BRL", availability: "https://schema.org/InStock" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: String(testimonials.length) }
    });
    document.head.appendChild(script);
    return () => {document.head.removeChild(script);};
  }, [price, mainPlan]);

  const handleCheckout = (url?: string, planName?: string, planPrice?: number) => {
    // AddToCart when a specific plan is chosen
    if (planName) {
      const addCartId = trackAddToCart({ content_name: planName, value: planPrice, currency: "BRL" });
      if (user?.email) sendCAPIEvent("AddToCart", user.email, { event_id: addCartId, value: planPrice, custom_data: { content_name: planName } });
    }
    const eventId = trackInitiateCheckout();
    if (user?.email) sendCAPIEvent("InitiateCheckout", user.email, { event_id: eventId });
    const targetUrl = appendUtmsToUrl(url || checkoutUrl);
    if (targetUrl && targetUrl !== "#") window.open(targetUrl, "_blank");
  };

  const CTAButton = ({ full = false, url }: {full?: boolean;url?: string;}) =>
  <button
    onClick={() => handleCheckout(url)}
    className={`${full ? "w-full" : ""} gradient-gold text-accent-foreground px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-gold inline-flex items-center justify-center gap-2 shadow-gold`}>

      {ctaText} <ChevronRight className="h-5 w-5" />
    </button>;


  const DemoButton = ({ className = "" }: {className?: string;}) =>
  <button
    onClick={() => navigate("/demo")}
    className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl border-2 border-primary/30 text-primary font-bold transition-all hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] ${className}`}>

      <Play className="h-4 w-4" /> Experimentar Grátis
    </button>;


  return (
    <div className="min-h-screen bg-background">
      {/* Urgency Bar */}
      <div className="gradient-sacred text-primary-foreground flex items-center justify-between py-2.5 px-4 text-sm font-semibold sticky top-0 z-50">
        <span className="flex-1 text-center">{urgencyText}</span>
        <button
          onClick={() => navigate("/auth")}
          className="shrink-0 ml-4 bg-accent text-accent-foreground px-4 py-1.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">

          Entrar
        </button>
      </div>

      {/* Hero */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-accent/15 text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              Método Oluwo Ifatokun
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 leading-tight text-foreground">
              {headline}
            </h1>
            <p className="text-base text-muted-foreground mb-8 max-w-xl leading-relaxed">Baseado na jornada Ifatokun, esse app tem o propósito de ajudar a você, sendo guiado pelo Oluwo Ifatokun - da forma como ele ensina.

            </p>

            {plans && plans.length > 1 ?
            <div className="grid gap-3 sm:grid-cols-2 mb-6 max-w-md mx-auto md:mx-0">
                {plans.map((plan, i) =>
              <div key={plan.id} className={`bg-card rounded-2xl p-5 border shadow-soft text-center ${i === 0 ? "border-accent ring-2 ring-accent/20" : "border-border"}`}>
                    {i === 0 && <span className="inline-block bg-accent text-accent-foreground text-[10px] font-bold px-3 py-0.5 rounded-full mb-2 uppercase">Mais Popular</span>}
                    <h3 className="font-display font-bold text-base mb-1">{plan.name}</h3>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                      <span className="text-xs font-normal text-muted-foreground">{PERIOD_LABELS[plan.billing_period] || "/mês"}</span>
                    </div>
                    {plan.description && <p className="text-[11px] text-muted-foreground mb-3">{plan.description}</p>}
                    <button
                  onClick={() => handleCheckout(plan.guru_checkout_url || undefined, plan.name, Number(plan.price))}
                  className="w-full gradient-gold text-accent-foreground py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">

                      Assinar
                    </button>
                  </div>
              )}
              </div> :

            <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-4 justify-center md:justify-start">
                  <span className="text-4xl font-display font-bold text-foreground">R$ {price}</span>
                  <span className="text-sm text-muted-foreground">{periodLabel}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center md:items-start">
                  <CTAButton />
                  <DemoButton />
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">Pagamento seguro • Cancele quando quiser • Garantia de {guaranteeDays} dias</p>
              </div>
            }
          </div>

          {/* Phone mockup - 3D floating effect */}
          <div className="shrink-0 mt-8 md:mt-0"
          style={{
            transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
            filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.15))"
          }}>

            <PhoneMockup size="large">
              <HomeMockupContent />
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* Authority */}
      <AuthoritySection />

      {/* Pain Points */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-3 text-foreground">Você já passou por isso?</h2>
          <p className="text-muted-foreground mb-10">Se identificou com alguma dessas situações, o Gba-Orun foi feito para você.</p>
          <div className="grid gap-3 text-left">
            {pains.map((pain, i) =>
            <div key={i} className="flex items-start gap-3 bg-card rounded-2xl p-4 shadow-soft border-l-4 border-accent">
                <HelpCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-foreground font-medium text-sm">{pain}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* App Gallery - "Veja como funciona" */}
      <section className="py-16 px-6 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-3 text-foreground">Veja como funciona</h2>
          <p className="text-muted-foreground mb-10">Navegue pelo app completo sem compromisso</p>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory justify-start md:justify-center md:items-end px-4 -mx-4">
            {[
            { title: "Tela Inicial", content: <HomeMockupContent />, delay: 0 },
            { title: "Consulte o Oráculo", content: <OracleMockupContent />, delay: 100 },
            { title: "Siga os Rituais", content: <RitualsMockupContent />, delay: 200 },
            { title: "Evolua na Jornada", content: <JourneyMockupContent />, delay: 300 },
            { title: "Aprenda Sempre", content: <LearnMockupContent />, delay: 400 }].
            map((mockup, i) =>
            <div key={mockup.title} className={`shrink-0 ${i === 1 || i === 2 ? "md:-translate-y-4" : ""}`}>
                <PhoneMockup title={mockup.title} delay={mockup.delay}>
                  {mockup.content}
                </PhoneMockup>
              </div>
            )}
          </div>
          <div className="mt-8">
            <DemoButton />
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-16 px-6 bg-accent/10">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-3 text-foreground">Experimente antes de assinar</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Navegue pelo app completo, faça uma consulta ao Oráculo e veja o resultado — sem precisar criar conta.
          </p>
          <button
            onClick={() => navigate("/demo")}
            className="gradient-gold text-accent-foreground px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-gold inline-flex items-center justify-center gap-2">

            <Play className="h-5 w-5" /> Iniciar Demonstração Gratuita
          </button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-10 text-foreground">O que você vai receber</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
            { icon: Compass, title: "Oráculo do Obi", desc: "Interprete cada caída com precisão e confiança." },
            { icon: BookOpen, title: "Receitas de Ebo", desc: "Ebós completos com materiais, cantigas e procedimentos." },
            { icon: Headphones, title: "Áudios Exclusivos", desc: "Áudios gravados para guiar sua prática ritual." },
            { icon: Shield, title: "Proteção de Iyami", desc: "Rituais de proteção e cuidado espiritual ancestral." },
            { icon: Zap, title: "Jornada Gamificada", desc: "Acompanhe seu progresso espiritual com XP e conquistas." },
            { icon: Star, title: "Atualizações Contínuas", desc: "Novos conteúdos e funcionalidades inclusos na assinatura." }].
            map((b, i) =>
            <div key={i} className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <b.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-card">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-10 text-foreground">Como funciona</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
            { step: "1", title: "Assine", desc: "Escolha seu plano e crie sua conta em segundos." },
            { step: "2", title: "Consulte", desc: "Use o Oráculo do Obi e descubra o caminho." },
            { step: "3", title: "Pratique", desc: "Siga os rituais indicados e evolua espiritualmente." }].
            map((s, i) =>
            <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full gradient-sacred text-primary-foreground flex items-center justify-center font-display font-bold text-xl shadow-sacred">
                  {s.step}
                </div>
                <h3 className="font-display font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-10 text-foreground">O que dizem nossos alunos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t, i) =>
            <div key={i} className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent-foreground">
                    {t.name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-foreground">{t.name}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: t.stars }).map((_, j) =>
                <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                )}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Plans */}
      {plans && plans.length > 1 &&
      <section className="py-16 px-6 bg-card">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold mb-10 text-foreground">Escolha seu plano</h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg mx-auto">
              {plans.map((plan, i) =>
            <div key={plan.id} className={`bg-background rounded-2xl p-6 border shadow-soft text-center ${i === 0 ? "border-accent ring-2 ring-accent/20" : "border-border"}`}>
                  {i === 0 && <span className="inline-block bg-accent text-accent-foreground text-[10px] font-bold px-3 py-0.5 rounded-full mb-2 uppercase">Mais Popular</span>}
                  <h3 className="font-display font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                    <span className="text-sm font-normal text-muted-foreground">{PERIOD_LABELS[plan.billing_period] || "/mês"}</span>
                  </div>
                  {plan.description && <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>}
                  <button
                onClick={() => handleCheckout(plan.guru_checkout_url || undefined, plan.name, Number(plan.price))}
                className="w-full gradient-gold text-accent-foreground py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">

                    Assinar {plan.name}
                  </button>
                </div>
            )}
            </div>
          </div>
        </section>
      }

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-10 text-foreground">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) =>
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-2xl px-5 border-none shadow-soft">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline text-sm">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            )}
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
          <p className="text-muted-foreground leading-relaxed text-sm">
            Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro em até {guaranteeDays} dias. Sem perguntas, sem burocracia.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 gradient-sacred text-primary-foreground">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Pronto para transformar sua prática?</h2>
          <p className="text-primary-foreground/70 text-sm mb-8">Acesso imediato a todo o conteúdo. Cancele quando quiser. Garantia total.</p>
          <div className="flex items-baseline justify-center gap-3 mb-6">
            <span className="text-5xl font-display font-bold">R$ {price}</span>
            <span className="text-base text-primary-foreground/60">{periodLabel}</span>
          </div>
          <button
            onClick={() => handleCheckout()}
            className="w-full max-w-sm gradient-gold text-accent-foreground px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-gold inline-flex items-center justify-center gap-2">

            {ctaText} <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mt-4">
            <button
              onClick={() => navigate("/demo")}
              className="text-primary-foreground/70 hover:text-primary-foreground text-sm underline underline-offset-4 inline-flex items-center gap-1">

              <Play className="h-3.5 w-3.5" /> Ou experimente grátis
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Gba-Orun — Sabedoria Ancestral Yorubá</p>
          <p>Este produto não substitui orientação religiosa presencial.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link to="/termos" className="underline hover:text-foreground">Termos de Uso</Link>
            <Link to="/privacidade" className="underline hover:text-foreground">Política de Privacidade</Link>
          </div>
          <p>© {new Date().getFullYear()} Gba-Orun. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>);

};

export default OfertaPage;