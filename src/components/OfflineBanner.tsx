import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

const OfflineBanner = () => {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 text-center text-sm font-medium py-2 px-4 flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="h-4 w-4" />
      Você está offline — mostrando conteúdo salvo
    </div>
  );
};

export default OfflineBanner;
