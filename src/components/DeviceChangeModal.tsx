import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Smartphone } from "lucide-react";

interface DeviceChangeModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeviceChangeModal = ({ open, onConfirm, onCancel }: DeviceChangeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Smartphone className="h-6 w-6 text-accent-foreground" />
          </div>
          <DialogTitle className="text-center">Novo dispositivo detectado</DialogTitle>
          <DialogDescription className="text-center">
            Detectamos que você está acessando de um novo dispositivo. Se continuar, o dispositivo anterior será desativado e você não poderá mais usá-lo sem entrar em contato com o suporte do Gba-Orun.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Continuar neste dispositivo
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-muted transition-colors"
          >
            Cancelar e sair
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceChangeModal;
