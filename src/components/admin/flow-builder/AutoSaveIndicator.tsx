import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Circle, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "saved" | "dirty" | "saving";
  lastSavedAt: Date | null;
}

const AutoSaveIndicator = ({ status, lastSavedAt }: AutoSaveIndicatorProps) => {
  return (
    <div className="flex items-center gap-1.5 text-xs select-none">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Salvando...</span>
        </>
      )}
      {status === "dirty" && (
        <>
          <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <span className="text-yellow-600 dark:text-yellow-400">Alterações não salvas</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400">
            Salvo
            {lastSavedAt && (
              <span className="text-muted-foreground ml-1">
                · {formatDistanceToNow(lastSavedAt, { addSuffix: true, locale: ptBR })}
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
