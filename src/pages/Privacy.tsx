import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background px-5 py-10">
    <div className="max-w-2xl mx-auto">
      <Link to="/oferta" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-3xl font-display font-bold mb-6">Política de Privacidade</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p><strong>Última atualização:</strong> {new Date().toLocaleDateString("pt-BR")}</p>

        <h2 className="text-lg font-bold text-foreground">1. Dados Coletados</h2>
        <p>Coletamos os seguintes dados pessoais: nome, email, data de nascimento (opcional), gênero (opcional) e dados de uso da Plataforma (histórico de consultas, preferências).</p>

        <h2 className="text-lg font-bold text-foreground">2. Finalidade do Uso</h2>
        <p>Seus dados são utilizados para: fornecer e personalizar o serviço, processar pagamentos, enviar comunicações relevantes e melhorar a experiência do usuário.</p>

        <h2 className="text-lg font-bold text-foreground">3. Compartilhamento de Dados</h2>
        <p>Seus dados não são vendidos a terceiros. Compartilhamos dados apenas com: processadores de pagamento (Digital Manager Guru), serviços de infraestrutura (hospedagem e banco de dados) e quando exigido por lei.</p>

        <h2 className="text-lg font-bold text-foreground">4. Armazenamento e Segurança</h2>
        <p>Seus dados são armazenados em servidores seguros com criptografia. Implementamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado.</p>

        <h2 className="text-lg font-bold text-foreground">5. Cookies e Rastreamento</h2>
        <p>Utilizamos cookies e tecnologias similares para melhorar a experiência, analisar o uso da Plataforma e personalizar anúncios (Meta Pixel, Google Ads). Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.</p>

        <h2 className="text-lg font-bold text-foreground">6. Seus Direitos (LGPD)</h2>
        <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a: acessar seus dados, corrigir informações incorretas, solicitar a exclusão dos seus dados, revogar consentimento e solicitar portabilidade dos dados.</p>

        <h2 className="text-lg font-bold text-foreground">7. Retenção de Dados</h2>
        <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após exclusão da conta, os dados são removidos em até 30 dias, exceto quando a retenção for exigida por obrigação legal.</p>

        <h2 className="text-lg font-bold text-foreground">8. Contato do Encarregado (DPO)</h2>
        <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato pelo email disponibilizado na Plataforma.</p>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
