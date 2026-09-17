import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { DineInItemForm } from "@/components/admin/DineInItemForm";
import { isCurrentUserAdmin } from "@/lib/admin";
import { brl } from "@/lib/order";
import {
  deleteDineInCategory,
  deleteDineInItem,
  fetchDineInCategories,
  fetchDineInItems,
  saveDineInCategory,
  setDineInCategorySortOrder,
  setDineInItemSortOrder,
  type DineInCategory,
  type DineInItem,
} from "@/lib/dinein-db";
import { resolveProductImageUrl } from "@/lib/products-db";

export const Route = createFileRoute("/admin/cardapio")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Cardápio do Salão | Painel América Frios" },
      {
        name: "description",
        content: "Gestão do cardápio de consumo no local da América Frios.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Cardápio do Salão | Painel América Frios" },
      {
        property: "og:description",
        content: "Área restrita para gerenciar o cardápio do salão.",
      },
    ],
  }),
  component: AdminDineInPage,
});

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

function AdminDineInPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DineInItem | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<DineInCategory | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-dinein-categories"],
    queryFn: fetchDineInCategories,
  });
  const itemsQuery = useQuery({ queryKey: ["admin-dinein-items"], queryFn: fetchDineInItems });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);

  function refreshAll() {
    void categoriesQuery.refetch();
    void itemsQuery.refetch();
  }

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    void (async () => {
      const map: Record<string, string | null> = {};
      await Promise.all(
        items.map(async (i) => {
          map[i.id] = await resolveProductImageUrl(i.image_url);
        }),
      );
      if (!cancelled) setImageUrls(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const categoryMutation = useMutation({
    mutationFn: (input: { id?: string; name: string; description: string | null; active: boolean }) =>
      saveDineInCategory(input),
    onSuccess: () => {
      toast.success("Categoria salva.");
      setNewCategoryName("");
      setEditingCategory(null);
      refreshAll();
    },
    onError: () => toast.error("Não foi possível salvar a categoria."),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteDineInCategory(id),
    onSuccess: () => {
      toast.success("Categoria excluída.");
      refreshAll();
    },
    onError: () => toast.error("Não foi possível excluir a categoria."),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => deleteDineInItem(id),
    onSuccess: () => {
      toast.success("Item excluído do cardápio.");
      refreshAll();
    },
    onError: () => toast.error("Não foi possível excluir o item."),
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number; kind: "item" | "category" }[]) => {
      for (const u of updates) {
        if (u.kind === "item") await setDineInItemSortOrder(u.id, u.sort_order);
        else await setDineInCategorySortOrder(u.id, u.sort_order);
      }
    },
    onSuccess: refreshAll,
    onError: () => toast.error("Não foi possível reordenar."),
  });

  function moveCategory(index: number, direction: -1 | 1) {
    const target = categories[index + direction];
    const current = categories[index];
    if (!target || !current) return;
    reorderMutation.mutate([
      { id: current.id, sort_order: index + direction, kind: "category" },
      { id: target.id, sort_order: index, kind: "category" },
    ]);
  }

  function moveItem(list: DineInItem[], index: number, direction: -1 | 1) {
    const target = list[index + direction];
    const current = list[index];
    if (!target || !current) return;
    reorderMutation.mutate([
      { id: current.id, sort_order: index + direction, kind: "item" },
      { id: target.id, sort_order: index, kind: "item" },
    ]);
  }

  return (
    <AdminShell
      title="Cardápio do Salão"
      subtitle="Catálogo independente para consumo no local. Não afeta a loja online."
      actions={
        <>
          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Atualizar
          </button>
          <button
            onClick={() => {
              if (categories.length === 0) {
                toast.error("Crie uma categoria antes de adicionar itens.");
                return;
              }
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Novo item
          </button>
        </>
      }
    >
      {/* Categorias */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4">
        <h2 className="font-display text-lg font-bold text-foreground">Categorias</h2>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newCategoryName.trim();
            if (!name) return;
            categoryMutation.mutate({ name, description: null, active: true });
          }}
        >
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nova categoria (ex.: Porções)"
            maxLength={40}
            className={`${inputClass} sm:max-w-xs`}
          />
          <button
            type="submit"
            disabled={categoryMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            Adicionar
          </button>
        </form>

        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma categoria criada ainda.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {categories.map((c, index) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-3"
              >
                {editingCategory?.id === c.id ? (
                  <>
                    <input
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, name: e.target.value })
                      }
                      className={`${inputClass} sm:max-w-xs`}
                    />
                    <input
                      value={editingCategory.description ?? ""}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, description: e.target.value })
                      }
                      placeholder="Descrição (opcional)"
                      className={`${inputClass} sm:max-w-sm`}
                    />
                    <button
                      onClick={() =>
                        categoryMutation.mutate({
                          id: editingCategory.id,
                          name: editingCategory.name.trim(),
                          description: editingCategory.description?.trim() || null,
                          active: editingCategory.active,
                        })
                      }
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {c.active ? "Ativa" : "Desativada"}
                    </span>
                    <div className="ml-auto flex flex-wrap gap-2">
                      <button
                        onClick={() => moveCategory(index, -1)}
                        disabled={index === 0}
                        aria-label="Mover categoria para cima"
                        className="rounded-lg border border-border p-1.5 hover:bg-accent disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveCategory(index, 1)}
                        disabled={index === categories.length - 1}
                        aria-label="Mover categoria para baixo"
                        className="rounded-lg border border-border p-1.5 hover:bg-accent disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(c)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                      >
                        Renomear
                      </button>
                      <button
                        onClick={() =>
                          categoryMutation.mutate({
                            id: c.id,
                            name: c.name,
                            description: c.description,
                            active: !c.active,
                          })
                        }
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                      >
                        {c.active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Excluir a categoria "${c.name}" e todos os seus itens do cardápio?`,
                            )
                          ) {
                            deleteCategoryMutation.mutate(c.id);
                          }
                        }}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-accent"
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Itens por categoria */}
      {itemsQuery.isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando cardápio…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {categories.map((category) => {
            const list = items.filter((i) => i.category_id === category.id);
            return (
              <section key={category.id} className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-lg font-bold text-foreground">{category.name}</h3>
                {list.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Nenhum item nesta categoria.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {list.map((item, index) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
                      >
                        {imageUrls[item.id] ? (
                          <img
                            src={imageUrls[item.id]!}
                            alt={item.name}
                            className="h-14 w-14 rounded-xl object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 font-semibold text-foreground">
                            {item.name}
                            {item.featured && <Star className="h-4 w-4 text-primary" />}
                          </p>
                          <p className="text-sm tabular-nums text-muted-foreground">
                            {brl(item.price)}
                          </p>
                          {!item.available && (
                            <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                              Indisponível
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => moveItem(list, index, -1)}
                            disabled={index === 0}
                            aria-label="Mover item para cima"
                            className="rounded-lg border border-border p-1.5 hover:bg-accent disabled:opacity-40"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveItem(list, index, 1)}
                            disabled={index === list.length - 1}
                            aria-label="Mover item para baixo"
                            className="rounded-lg border border-border p-1.5 hover:bg-accent disabled:opacity-40"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditing(item);
                              setFormOpen(true);
                            }}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir "${item.name}" do cardápio?`)) {
                                deleteItemMutation.mutate(item.id);
                              }
                            }}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-accent"
                          >
                            Excluir
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {formOpen && (
        <DineInItemForm
          item={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={refreshAll}
        />
      )}
    </AdminShell>
  );
}
