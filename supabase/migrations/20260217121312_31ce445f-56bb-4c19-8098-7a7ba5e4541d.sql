
ALTER TABLE public.oracle_configs
  ADD COLUMN default_ire_ibi TEXT NOT NULL DEFAULT 'ibi';

-- Set initial values based on traditional meanings
UPDATE public.oracle_configs SET default_ire_ibi = 'ire' WHERE result_key IN ('ejife', 'etagun', 'alafia');
UPDATE public.oracle_configs SET default_ire_ibi = 'ibi' WHERE result_key IN ('oyekun', 'okaran');
