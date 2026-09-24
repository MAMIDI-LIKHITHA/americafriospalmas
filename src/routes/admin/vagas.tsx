import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { isCurrentUserAdmin } from "@/lib/admin";
import {
  deleteJobOpening,
  fetchAdminJobOpenings,
  saveJobOpening,
  type JobOpening,
} from "@/lib/jobs-db";

export const Route = createFileRoute("/admin/vagas")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Vagas | Painel América Frios" },
      {
        name: "description",
        content: "Gestão das vagas de emprego exibidas na página Trabalhe Conosco.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Vagas | Painel América Frios" },
      {
        property: "og:description",
        content: "Área restrita para gerenciar as vagas de emprego do site.",
      },
    ],
  }),
  component: AdminJobsPage,
});

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

type FormState = {
  title: string;
  store: string;
  city: string;
  requirements: string;
  note: string;
  whatsapp_display: string;
  whatsapp_intl: string;
  active: boolean;
  sort_order: number;
};

const EMPTY_FORM: FormState = {
  title: "",
  store: "",
  city: "Palmas/TO",
  requirements: "",
  note: "",
  whatsapp_display: "63 98402-1014",
  whatsapp_intl: "5563984021014",
  active: true,
  sort_order: 0,
};

function AdminJobsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<JobOpening | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const openingsQuery = useQuery({
    queryKey: ["admin-job-openings"],
    queryFn: fetchAdminJobOpenings,
  });
  const openings = openingsQuery.data ?? [];

  const saveMutation = useMutation({
    mutationFn: saveJobOpening,
    onSuccess: () => {
      toast.success("Vaga salva.");
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      void openingsQuery.refetch();
    },
    onError: () => toast.error("Não foi possível salvar a vaga."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJobOpening,
    onSuccess: () => {
      toast.success("Vaga excluída.");
      void openingsQuery.refetch();
    },
    onError: () => toast.error("Não foi possível excluir a vaga."),
  });

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sort_order: openings.length });
    setFormOpen(true);
  }

  function openEdit(o: JobOpening) {
    setEditing(o);
    setForm({
      title: o.title,
      store: o.store,
      city: o.city,
      requirements: o.requirements,
      note: o.note ?? "",
      whatsapp_display: o.whatsapp_display,
      whatsapp_intl: o.whatsapp_intl,
      active: o.active,
      sort_order: o.sort_order,
    });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Informe o título da vaga.");
      return;
    }
    saveMutation.mutate({ id: editing?.id, ...form });
  }

  return (
    <AdminShell
      title="Vagas de emprego"
      subtitle="Gerencie as oportunidades exibidas na página Trabalhe Conosco."
      actions={
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nova vaga
        </button>
      }
    >
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">
                Título da vaga *
              </span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="Área de Produção"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">Loja</span>
              <input
                value={form.store}
                onChange={(e) => setForm({ ...form, store: e.target.value })}
                className={inputClass}
                placeholder="Loja 903 Sul"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">Cidade</span>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
                placeholder="Palmas/TO"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">
                Ordem de exibição
              </span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: Number(e.target.value) || 0 })
                }
                className={inputClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">
              Requisitos (um por linha)
            </span>
            <textarea
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className={`${inputClass} resize-y`}
              rows={6}
              placeholder={"Com ou sem experiência\nBoa comunicação"}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">
              Observação em destaque (opcional)
            </span>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={inputClass}
              placeholder="Residir em bairros próximos!"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">
                WhatsApp exibido
              </span>
              <input
                value={form.whatsapp_display}
                onChange={(e) => setForm({ ...form, whatsapp_display: e.target.value })}
                className={inputClass}
                placeholder="63 99220-7950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">
                WhatsApp (formato internacional, só números)
              </span>
              <input
                value={form.whatsapp_intl}
                onChange={(e) => setForm({ ...form, whatsapp_intl: e.target.value })}
                className={inputClass}
                placeholder="5563992207950"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            Vaga ativa (visível no site)
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saveMutation.isPending ? "Salvando..." : editing ? "Salvar alterações" : "Criar vaga"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
                setForm(EMPTY_FORM);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {openingsQuery.isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Carregando vagas...</p>
        ) : openings.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Nenhuma vaga cadastrada. Clique em "Nova vaga" para começar.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {openings.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{o.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[o.store, o.city].filter(Boolean).join(" — ") || "Sem local"} ·{" "}
                    {o.whatsapp_display} ·{" "}
                    {o.active ? (
                      <span className="font-semibold text-primary">Ativa</span>
                    ) : (
                      <span className="font-semibold text-muted-foreground">Inativa</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => openEdit(o)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Excluir a vaga "${o.title}"?`)) {
                      deleteMutation.mutate(o.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
