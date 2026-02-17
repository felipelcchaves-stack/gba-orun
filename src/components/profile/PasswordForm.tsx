import { useState } from "react";
import { useUpdatePassword } from "@/hooks/useProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const PasswordForm = () => {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const updatePw = useUpdatePassword();

  const handleSave = () => {
    if (pw.length < 6) { toast.error("A senha deve ter no mínimo 6 caracteres."); return; }
    if (pw !== confirm) { toast.error("As senhas não coincidem."); return; }
    updatePw.mutate(pw, { onSuccess: () => { setPw(""); setConfirm(""); } });
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <h2 className="font-display text-lg font-semibold">Segurança</h2>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-pw">Nova senha</Label>
        <Input id="new-pw" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-pw">Confirmar senha</Label>
        <Input id="confirm-pw" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
      </div>

      <Button onClick={handleSave} disabled={updatePw.isPending} variant="outline" className="w-full">
        Alterar senha
      </Button>
    </div>
  );
};

export default PasswordForm;
