import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => (
  <div className="min-h-screen bg-background px-5 py-10">
    <div className="max-w-2xl mx-auto">
      <Link to="/oferta" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-3xl font-display font-bold mb-6">Termos de Uso</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p><strong>Última atualização:</strong> {new Date().toLocaleDateString("pt-BR")}</p>

        <h2 className="text-lg font-bold text-foreground">1. Aceitação dos Termos</h2>
        <p>Ao acessar e utilizar o aplicativo Gba-Orun ("Plataforma"), você concorda integralmente com estes Termos de Uso. Caso não concorde, não utilize a Plataforma.</p>

        <h2 className="text-lg font-bold text-foreground">2. Descrição do Serviço</h2>
        <p>O Gba-Orun é uma plataforma digital de conteúdo educacional sobre a tradição Yorubá, incluindo oráculo do Obi, rituais, Orikis e práticas espirituais. O conteúdo é disponibilizado mediante assinatura mensal.</p>

        <h2 className="text-lg font-bold text-foreground">3. Cadastro e Conta</h2>
        <p>Para acessar o conteúdo, é necessário criar uma conta com email e senha válidos. Você é responsável por manter a confidencialidade das suas credenciais de acesso. O acesso é pessoal e intransferível, limitado a um dispositivo por conta.</p>

        <h2 className="text-lg font-bold text-foreground">4. Assinatura e Pagamento</h2>
        <p>O acesso ao conteúdo premium é realizado mediante assinatura recorrente. O pagamento é processado pela plataforma Digital Manager Guru. A renovação é automática, podendo ser cancelada a qualquer momento pelo assinante.</p>

        <h2 className="text-lg font-bold text-foreground">5. Cancelamento e Reembolso</h2>
        <p>O cancelamento pode ser realizado a qualquer momento. O acesso permanece ativo até o final do período já pago. Reembolsos são concedidos conforme a política de garantia vigente no momento da compra.</p>

        <h2 className="text-lg font-bold text-foreground">6. Propriedade Intelectual</h2>
        <p>Todo o conteúdo disponibilizado na Plataforma é protegido por direitos autorais. É proibida a reprodução, distribuição ou compartilhamento sem autorização expressa.</p>

        <h2 className="text-lg font-bold text-foreground">7. Limitação de Responsabilidade</h2>
        <p>O Gba-Orun é uma ferramenta educacional e não substitui orientação religiosa presencial, aconselhamento médico ou terapêutico. O uso da Plataforma é de responsabilidade exclusiva do usuário.</p>

        <h2 className="text-lg font-bold text-foreground">8. Modificações</h2>
        <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação na Plataforma.</p>

        <h2 className="text-lg font-bold text-foreground">9. Contato</h2>
        <p>Para dúvidas sobre estes Termos, entre em contato pelo email disponibilizado na Plataforma.</p>
      </div>
    </div>
  </div>
);

export default TermsPage;
