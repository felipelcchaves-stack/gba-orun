import heroBanner from "@/assets/hero-banner.webp";

const AuthoritySection = () => (
  <section className="py-16 md:py-20 px-6 gradient-sacred text-primary-foreground">
    <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
      <div className="shrink-0">
        <img
          src={heroBanner}
          alt="Oluwo Ifatokun"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-accent shadow-xl"
        />
      </div>
      <div className="text-center md:text-left">
        <span className="inline-block bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
          Sobre o Método
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
          Método Oluwo Ifatokun
        </h2>
        <p className="text-primary-foreground/80 leading-relaxed text-sm md:text-base">
          Baseado na sabedoria ancestral do Oluwo Ifatokun, sacerdote de Ifá dedicado a preservar e transmitir o conhecimento sagrado da tradição Yorubá. Este app reúne décadas de experiência ritualística em um guia digital completo, fiel aos fundamentos e acessível a todos os praticantes.
        </p>
      </div>
    </div>
  </section>
);

export default AuthoritySection;
