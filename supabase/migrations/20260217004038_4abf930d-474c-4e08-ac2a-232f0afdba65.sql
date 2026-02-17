
-- ============================================
-- Table: oracle_configs (5 Obi results)
-- ============================================
CREATE TABLE public.oracle_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_key text NOT NULL UNIQUE,
  name text NOT NULL,
  meaning text NOT NULL DEFAULT '',
  description_ire text NOT NULL DEFAULT '',
  description_ibi text NOT NULL DEFAULT '',
  color_type text NOT NULL DEFAULT 'accent',
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.oracle_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Oracle configs are publicly readable"
  ON public.oracle_configs FOR SELECT USING (true);

CREATE POLICY "Admins can manage oracle configs"
  ON public.oracle_configs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed with current hardcoded values
INSERT INTO public.oracle_configs (result_key, name, meaning, description_ire, description_ibi, color_type, display_order) VALUES
  ('oyekun', 'Oyekun', 'Nenhum aberto — NÃO', 'Mesmo em Irê, Oyekun pede cautela. Há bênçãos, mas estão travadas. Faça oferendas para destravar o caminho.', 'Oyekun em Ibi indica bloqueio total. É preciso agir com urgência para limpar os caminhos.', 'danger', 1),
  ('okaran', 'Okaran', '1 aberto — TALVEZ', 'Okaran em Irê mostra que o caminho está se abrindo, mas precisa de reforço. Continue com as oferendas.', 'Okaran em Ibi é um aviso sério. Há um problema específico que precisa de atenção imediata.', 'warning', 2),
  ('ejife', 'Ejife', '2 abertos — SIM', 'Ejife em Irê é a melhor confirmação. O Orixá sorriu! Agradeça e mantenha a rotina espiritual.', 'Ejife em Ibi é raro, mas indica que mesmo no desafio há equilíbrio. Cuide do que foi apontado.', 'success', 3),
  ('etagun', 'Etagun', '3 abertos — SIM FORTE', 'Etagun em Irê é uma benção poderosa. Tudo flui a seu favor. Oriki de agradecimento é essencial.', 'Etagun em Ibi pede atenção: muita abertura pode indicar dispersão. Foque no essencial.', 'success', 4),
  ('alafia', 'Alafia', 'Todos abertos — PAZ (confirme)', 'Alafia em Irê é paz absoluta. Mas confirme com outra jogada para ter certeza.', 'Alafia em Ibi pede confirmação. A paz aparente pode esconder algo. Jogue novamente.', 'accent', 5);

-- ============================================
-- Table: oracle_task_templates (task rules)
-- ============================================
CREATE TABLE public.oracle_task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_result_key text,
  ire_or_ibi text,
  condition text NOT NULL DEFAULT 'always',
  task_title text NOT NULL,
  task_type text NOT NULL,
  category text NOT NULL,
  ritual_id uuid REFERENCES public.rituals(id) ON DELETE SET NULL,
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.oracle_task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Oracle task templates are publicly readable"
  ON public.oracle_task_templates FOR SELECT USING (true);

CREATE POLICY "Admins can manage oracle task templates"
  ON public.oracle_task_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed with current hardcoded generateTasks() logic
INSERT INTO public.oracle_task_templates (oracle_result_key, ire_or_ibi, condition, task_title, task_type, category, display_order) VALUES
  (null, 'ibi', 'ebo_not_done', 'Fazer Ebó de Limpeza', 'ebo', 'ebo', 1),
  (null, 'ire', 'ebo_not_done', 'Fazer Ebó de Agradecimento', 'ebo', 'ebo', 1),
  (null, null, 'ebo_done', 'Ebó Apurado', 'ebo', 'ebo', 1),
  (null, null, 'ori_needs_ibori', 'Ibori de Proteção', 'ibori', 'ibori', 2),
  (null, null, 'ori_needs_oracao', 'Oração de Ori', 'oracao_ori', 'oracao_ori', 3),
  (null, null, 'ori_needs_ambos', 'Ibori de Proteção', 'ibori', 'ibori', 2),
  (null, null, 'ori_needs_ambos', 'Oração de Ori', 'oracao_ori', 'oracao_ori', 3),
  (null, null, 'iyami_wants', 'Oração de Iyami', 'oracao_iyami', 'oracao_iyami', 4),
  (null, null, 'iyami_wants', 'Cantiga de Apaziguamento', 'cantiga', 'cantiga', 5),
  (null, null, 'egbe_wants', 'Oferenda ao Egbe Orun', 'egbe_orun', 'egbe_orun', 6),
  (null, null, 'egbe_wants', 'Cantiga Sagrada', 'cantiga', 'cantiga', 7),
  (null, 'ibi', 'always', 'Oração da Noite', 'oracao_noite', 'oracao_noite', 8),
  (null, 'ire', 'always', 'Oração da Manhã', 'oracao_manha', 'oracao_manha', 8),
  (null, 'ire', 'always', 'Oriki de Agradecimento', 'oriki', 'oriki', 9);

-- ============================================
-- Table: oracle_step_texts (wizard step texts)
-- ============================================
CREATE TABLE public.oracle_step_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_key text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT ''
);

ALTER TABLE public.oracle_step_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Oracle step texts are publicly readable"
  ON public.oracle_step_texts FOR SELECT USING (true);

CREATE POLICY "Admins can manage oracle step texts"
  ON public.oracle_step_texts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed with current hardcoded texts
INSERT INTO public.oracle_step_texts (step_key, title, description) VALUES
  ('ire_ibi', 'Veio em Irê ou Ibi?', 'Identifique se o resultado veio no caminho positivo (Irê) ou negativo (Ibi).'),
  ('ebo', 'Você já apurou o Ebó?', 'Verifique se o ebó já foi determinado na consulta.'),
  ('ebo_ire', 'Qual tipo de Ebó em Irê?', 'Selecione o tipo de ebó que foi apurado no caminho positivo.'),
  ('ebo_ibi', 'Qual tipo de Ebó em Ibi?', 'Selecione o tipo de ebó que foi apurado para limpeza.'),
  ('ori', 'O Ori precisa de algo?', 'Verifique se o Ori (cabeça espiritual) precisa de cuidados.'),
  ('ori_ire', 'O que o Ori precisa em Irê?', 'Mesmo em caminho positivo, o Ori pode precisar de fortalecimento.'),
  ('ori_ibi', 'O que o Ori precisa em Ibi?', 'Em Ibi, o Ori quase sempre precisa de proteção e cuidado.'),
  ('iyami', 'As Iyami querem algo?', 'Verifique se as Grandes Mães Ancestrais pedem atenção.'),
  ('egbe', 'O Egbe Orun quer algo?', 'Verifique se a sua comunidade espiritual pede oferendas.');
