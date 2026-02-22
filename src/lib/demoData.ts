export const demoProfile = {
  id: "demo-profile",
  user_id: "demo-user",
  display_name: "Visitante",
  religion: null,
  care_day: null,
  is_premium: false,
  avatar_url: null,
  gender: null,
  birth_date: null,
  ifa_status: null,
};

export const demoUser = {
  id: "demo-user",
  email: "visitante@demo.com",
  user_metadata: { display_name: "Visitante" },
};

export const demoStats = {
  id: "demo-stats",
  user_id: "demo-user",
  xp_total: 150,
  streak_days: 3,
  oracle_throws: 5,
  rituals_read: 8,
  last_active: new Date().toISOString().split("T")[0],
  created_at: new Date().toISOString(),
};

const today = new Date();
const yesterday = new Date(Date.now() - 86400000);
const twoDaysAgo = new Date(Date.now() - 2 * 86400000);

export const demoJourneyEntries = [
  {
    id: "demo-j1",
    user_id: "demo-user",
    oracle_result: "alafia",
    completed: true,
    completed_at: twoDaysAgo.toISOString(),
    created_at: twoDaysAgo.toISOString(),
    context: "rotina_diaria",
    notes: null,
    flow_name: "Consulta Diária",
    suggested_ritual_id: null,
    rituals: null,
  },
  {
    id: "demo-j2",
    user_id: "demo-user",
    oracle_result: "ejikorere",
    completed: true,
    completed_at: yesterday.toISOString(),
    created_at: yesterday.toISOString(),
    context: "rotina_diaria",
    notes: null,
    flow_name: "Consulta Diária",
    suggested_ritual_id: null,
    rituals: null,
  },
  {
    id: "demo-j3",
    user_id: "demo-user",
    oracle_result: "etawa",
    completed: false,
    completed_at: null,
    created_at: today.toISOString(),
    context: "rotina_diaria",
    notes: null,
    flow_name: "Consulta Diária",
    suggested_ritual_id: null,
    rituals: null,
  },
];

export const demoJourneyTasks = [
  { id: "demo-t1", journey_id: "demo-j3", user_id: "demo-user", task_type: "oracao", task_title: "Oração ao Ori", completed: true, completed_at: today.toISOString(), created_at: today.toISOString(), guidance_message: "Faça sua oração matinal ao Ori.", guidance_audio_url: null, ritual_id: null, offering_id: null },
  { id: "demo-t2", journey_id: "demo-j3", user_id: "demo-user", task_type: "ebo", task_title: "Preparar oferenda", completed: true, completed_at: today.toISOString(), created_at: today.toISOString(), guidance_message: null, guidance_audio_url: null, ritual_id: null, offering_id: null },
  { id: "demo-t3", journey_id: "demo-j3", user_id: "demo-user", task_type: "cuidado_espiritual", task_title: "Banho de ervas", completed: false, completed_at: null, created_at: today.toISOString(), guidance_message: "Utilize ervas frescas para o banho.", guidance_audio_url: null, ritual_id: null, offering_id: null },
  { id: "demo-t4", journey_id: "demo-j3", user_id: "demo-user", task_type: "leitura", task_title: "Estudar Oriki de Oxum", completed: false, completed_at: null, created_at: today.toISOString(), guidance_message: null, guidance_audio_url: null, ritual_id: null, offering_id: null },
  { id: "demo-t5", journey_id: "demo-j3", user_id: "demo-user", task_type: "oferenda", task_title: "Oferenda a Exu", completed: false, completed_at: null, created_at: today.toISOString(), guidance_message: null, guidance_audio_url: null, ritual_id: null, offering_id: null },
];
