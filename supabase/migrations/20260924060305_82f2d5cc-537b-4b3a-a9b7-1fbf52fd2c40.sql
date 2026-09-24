CREATE TABLE public.job_openings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  store text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  requirements text NOT NULL DEFAULT '',
  note text,
  whatsapp_intl text NOT NULL DEFAULT '5563984021014',
  whatsapp_display text NOT NULL DEFAULT '63 98402-1014',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_openings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_openings TO authenticated;
GRANT ALL ON public.job_openings TO service_role;
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active job openings are public" ON public.job_openings FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins can view all job openings" ON public.job_openings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert job openings" ON public.job_openings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update job openings" ON public.job_openings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete job openings" ON public.job_openings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_job_openings_updated_at BEFORE UPDATE ON public.job_openings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.job_openings (title, store, city, requirements, note, whatsapp_intl, whatsapp_display, active, sort_order) VALUES (
  'Área de Produção',
  'Loja 903 Sul',
  'Palmas/TO',
  'Com ou sem experiência
Boa comunicação
Ser organizada e proativa
Disponibilidade de horário
Preferencial residir em bairros próximos
Ser maior de 18 anos',
  'Residir em bairros próximos!',
  '5563992207950',
  '63 99220-7950',
  true,
  0
);