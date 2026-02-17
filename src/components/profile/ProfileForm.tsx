import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save } from "lucide-react";

const RELIGIONS = [
  { value: "candomble", label: "Candomblé" },
  { value: "umbanda", label: "Umbanda" },
  { value: "ifa", label: "Ifá" },
  { value: "outra", label: "Outra" },
  { value: "prefiro_nao_dizer", label: "Prefiro não dizer" },
];

const DAYS = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda" },
  { value: "2", label: "Terça" },
  { value: "3", label: "Quarta" },
  { value: "4", label: "Quinta" },
  { value: "5", label: "Sexta" },
  { value: "6", label: "Sábado" },
];

const ProfileForm = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [religion, setReligion] = useState("");
  const [careDay, setCareDay] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setReligion(profile.religion || "");
      setCareDay(profile.care_day !== null && profile.care_day !== undefined ? String(profile.care_day) : "");
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({
      display_name: name.trim() || null,
      religion: religion || null,
      care_day: careDay !== "" ? parseInt(careDay) : null,
    } as any);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <h2 className="font-display text-lg font-semibold">Dados Pessoais</h2>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nome de exibição</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
      </div>

      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={user?.email || ""} disabled className="opacity-60" />
      </div>

      <div className="space-y-1.5">
        <Label>Religião / Tradição</Label>
        <Select value={religion} onValueChange={setReligion}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {RELIGIONS.map(r => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Dia de Cuidado Espiritual</Label>
        <Select value={careDay} onValueChange={setCareDay}>
          <SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger>
          <SelectContent>
            {DAYS.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">O dia da semana que você reserva para se cuidar espiritualmente.</p>
      </div>

      <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full">
        <Save className="h-4 w-4 mr-2" /> Salvar
      </Button>
    </div>
  );
};

export default ProfileForm;
