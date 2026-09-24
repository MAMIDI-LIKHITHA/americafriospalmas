import { supabase } from "@/integrations/supabase/client";

export type JobOpening = {
  id: string;
  title: string;
  store: string;
  city: string;
  requirements: string;
  note: string | null;
  whatsapp_intl: string;
  whatsapp_display: string;
  active: boolean;
  sort_order: number;
};

export type JobOpeningInput = Omit<JobOpening, "id"> & { id?: string | undefined };

export async function fetchPublicJobOpenings(): Promise<JobOpening[]> {
  const { data, error } = await supabase
    .from("job_openings")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAdminJobOpenings(): Promise<JobOpening[]> {
  const { data, error } = await supabase
    .from("job_openings")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function saveJobOpening(input: JobOpeningInput): Promise<void> {
  const payload = {
    title: input.title.trim(),
    store: input.store.trim(),
    city: input.city.trim(),
    requirements: input.requirements,
    note: input.note?.trim() || null,
    whatsapp_intl: input.whatsapp_intl.trim(),
    whatsapp_display: input.whatsapp_display.trim(),
    active: input.active,
    sort_order: input.sort_order,
  };
  const query = input.id
    ? supabase.from("job_openings").update(payload).eq("id", input.id)
    : supabase.from("job_openings").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteJobOpening(id: string): Promise<void> {
  const { error } = await supabase.from("job_openings").delete().eq("id", id);
  if (error) throw error;
}
