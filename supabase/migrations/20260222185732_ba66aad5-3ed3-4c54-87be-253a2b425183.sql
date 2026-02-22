
-- Adicionar coluna flow_name na user_journey para guardar o nome do fluxo completado
ALTER TABLE public.user_journey ADD COLUMN flow_name text;

-- Adicionar coluna completion_phrase na oracle_flows para o admin definir a frase de conclusão
ALTER TABLE public.oracle_flows ADD COLUMN completion_phrase text NOT NULL DEFAULT '';
