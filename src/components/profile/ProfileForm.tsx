import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Bell } from "lucide-react";
import { toast } from "sonner";

const RELIGIONS = [
  { value: "candomble", label: "Candomblé" },
  { value: "umbanda", label: "Umbanda" },
  { value: "ifa", label: "Ifá" },
  { value: "outra", label: "Outra" },
  { value: "prefiro_nao_dizer", label: "Prefiro não dizer" },
];

const GENDERS = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "nao_binario", label: "Não-binário" },
  { value: "prefiro_nao_dizer", label: "Prefiro não dizer" },
];

const IFA_STATUSES = [
  { value: "babalawo", label: "Babalawo" },
  { value: "iyanifa", label: "Iyanifa" },
  { value: "omo_ifa", label: "Omo Ifá (Isefá)" },
  { value: "nao", label: "Não tenho Ifá" },
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
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [careDay, setCareDay] = useState("");
  const [ifaStatus, setIfaStatus] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setReligion(profile.religion || "");
      setGender(profile.gender || "");
      setBirthDate(profile.birth_date || "");
      setCareDay(profile.care_day !== null && profile.care_day !== undefined ? String(profile.care_day) : "");
      setIfaStatus(profile.ifa_status || "");
    }
  }, [profile]);

  const showIfaField = ["candomble", "ifa", "umbanda"].includes(religion);

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      display_name: name.trim() || null,
      religion: religion || null,
      gender: gender || null,
      birth_date: birthDate || null,
      care_day: careDay !== "" ? parseInt(careDay) : null,
      ifa_status: showIfaField ? (ifaStatus || null) : null,
    } as any);

    // Request notification permission when care day is set
    if (careDay !== "" && "Notification" in window && Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        toast.success("Notificações ativadas! Você será lembrado no seu dia de cuidado.");
      }
    }
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
        <Label>Gênero</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {GENDERS.map(g => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="birthDate">Data de Nascimento</Label>
        <Input id="birthDate" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
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

      {showIfaField && (
        <div className="space-y-1.5">
          <Label>Status em Ifá</Label>
          <Select value={ifaStatus} onValueChange={setIfaStatus}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {IFA_STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
        <div className="flex items-start gap-2 mt-1.5">
          <Bell className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Ao salvar, pediremos permissão para te lembrar no seu dia de cuidado espiritual.
          </p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full">
        <Save className="h-4 w-4 mr-2" /> Salvar
      </Button>
    </div>
  );
};

export default ProfileForm;
