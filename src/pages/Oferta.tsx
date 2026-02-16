import { ExternalLink, CheckCircle, Star, Shield, BookOpen } from "lucide-react";
import { trackInitiateCheckout } from "@/lib/pixel";

const CHECKOUT_URL = "https://pay.hotmart.com/SEU_PRODUTO"; // TODO: substituir

const testimonials = [
  { name: "Maria S.", text: "Nunca mais tive dúvida no Obi. Esse app mudou minha vida espiritual!", stars: 5 },
  { name: "João P.", text: "As receitas de Ebo são completas e fiéis à tradição. Recomendo demais!", stars: 5 },
  { name: "Ana L.", text: "Uso todos os dias no meu terreiro. Os Orikis são perfeitos.", stars: 5 },
];

const OfertaPage = () => {
  const handleCheckout = () => {
    trackInitiateCheckout();
    window.open(CHECKOUT_URL, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="gradient-sacred text-primary-foreground py-16 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-primary-foreground/20 text-sm font-semibold px-4 py-1 rounded-full mb-4">
            🔮 Acesso Vitalício
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
            Descubra o que o Orixá quer de você agora.
          </h1>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            O guia digital mais completo de Obi, Rituais e Orikis da tradição Yorubá. Tudo na palma da sua mão.
          </p>
          <button
            onClick={handleCheckout}
            className="gradient-gold text-accent-foreground px-8 py-4 rounded-2xl font-bold text-lg shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
          >
            Quero Acesso Completo <ExternalLink className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* VSL placeholder */}
      <section className="py-12 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="aspect-video bg-card rounded-2xl border border-border flex items-center justify-center">
            <p className="text-muted-foreground text-sm">📹 Vídeo de apresentação (cole seu embed aqui)</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-5 bg-card">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-8">O que você vai receber</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: BookOpen, title: "Sem dúvida no Obi", desc: "Aprenda a interpretar cada caída com precisão e confiança." },
              { icon: Shield, title: "Receitas de Ebo na mão", desc: "Ebós completos com materiais, cantigas e procedimentos." },
              { icon: Star, title: "Todos os Orikis", desc: "Acervo completo de Orikis para todos os Orixás." },
              { icon: Shield, title: "Proteção de Iyami", desc: "Rituais de proteção e cuidado espiritual ancestral." },
            ].map((b, i) => (
              <div key={i} className="bg-background rounded-2xl p-5 border border-border">
                <b.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-display font-bold text-lg mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-8">O que dizem nossos alunos</h2>
          <div className="space-y-4">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm mb-2 italic">"{t.text}"</p>
                <span className="text-xs text-muted-foreground font-semibold">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-5">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Pronto para transformar sua prática?</h2>
          <p className="text-muted-foreground mb-8">Acesso imediato a todo o conteúdo. Sem mensalidade.</p>
          <button
            onClick={handleCheckout}
            className="w-full gradient-gold text-accent-foreground py-4 rounded-2xl font-bold text-lg shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-5 w-5" /> Garantir Meu Acesso
          </button>
        </div>
      </section>
    </div>
  );
};

export default OfertaPage;
