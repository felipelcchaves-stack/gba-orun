import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen pb-24 px-6 bg-background flex flex-col items-center justify-center text-center gap-4">
        <span className="text-5xl">✅</span>
        <h1 className="text-2xl font-display font-bold">App já instalado!</h1>
        <p className="text-muted-foreground text-sm">O Gba-Orun já está na sua tela inicial.</p>
        <Link to="/" className="text-primary font-medium text-sm underline">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-6 bg-background">
      <div className="max-w-lg mx-auto pt-10 space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Início
        </Link>

        <div className="text-center space-y-2">
          <img src="/icons/icon-192.png" alt="Gba-Orun" className="h-20 w-20 mx-auto rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-display font-bold">Instalar Gba-Orun</h1>
          <p className="text-muted-foreground text-sm">Tenha o app na sua tela inicial, sem baixar da loja.</p>
        </div>

        {deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full" size="lg">
            <Download className="h-5 w-5 mr-2" /> Instalar agora
          </Button>
        ) : isIOS ? (
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="font-display font-semibold text-lg">No iPhone / iPad</h2>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full h-7 w-7 flex items-center justify-center font-bold shrink-0">1</span>
                <span>Toque no ícone <Share className="inline h-4 w-4 text-primary" /> <strong>Compartilhar</strong> na barra do Safari</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full h-7 w-7 flex items-center justify-center font-bold shrink-0">2</span>
                <span>Role e toque em <Plus className="inline h-4 w-4 text-primary" /> <strong>Adicionar à Tela de Início</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full h-7 w-7 flex items-center justify-center font-bold shrink-0">3</span>
                <span>Toque em <strong>Adicionar</strong> e pronto!</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="font-display font-semibold text-lg">No Android</h2>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full h-7 w-7 flex items-center justify-center font-bold shrink-0">1</span>
                <span>Abra o menu <strong>⋮</strong> do navegador (3 pontinhos)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full h-7 w-7 flex items-center justify-center font-bold shrink-0">2</span>
                <span>Toque em <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary rounded-full h-7 w-7 flex items-center justify-center font-bold shrink-0">3</span>
                <span>Confirme e pronto!</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPage;
