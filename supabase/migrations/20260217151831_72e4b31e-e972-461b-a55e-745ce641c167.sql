
-- Table: oracle_flows
CREATE TABLE public.oracle_flows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.oracle_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage oracle flows"
  ON public.oracle_flows FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Oracle flows are publicly readable"
  ON public.oracle_flows FOR SELECT
  USING (true);

CREATE TRIGGER update_oracle_flows_updated_at
  BEFORE UPDATE ON public.oracle_flows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: oracle_flow_nodes
CREATE TABLE public.oracle_flow_nodes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id uuid NOT NULL REFERENCES public.oracle_flows(id) ON DELETE CASCADE,
  node_type text NOT NULL,
  label text NOT NULL DEFAULT '',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  position_x float NOT NULL DEFAULT 0,
  position_y float NOT NULL DEFAULT 0
);

ALTER TABLE public.oracle_flow_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage oracle flow nodes"
  ON public.oracle_flow_nodes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Oracle flow nodes are publicly readable"
  ON public.oracle_flow_nodes FOR SELECT
  USING (true);

-- Table: oracle_flow_edges
CREATE TABLE public.oracle_flow_edges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id uuid NOT NULL REFERENCES public.oracle_flows(id) ON DELETE CASCADE,
  source_node_id uuid NOT NULL REFERENCES public.oracle_flow_nodes(id) ON DELETE CASCADE,
  target_node_id uuid NOT NULL REFERENCES public.oracle_flow_nodes(id) ON DELETE CASCADE,
  source_handle text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT ''
);

ALTER TABLE public.oracle_flow_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage oracle flow edges"
  ON public.oracle_flow_edges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Oracle flow edges are publicly readable"
  ON public.oracle_flow_edges FOR SELECT
  USING (true);
