import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";

import {
  saveDineInItem,
  uploadDineInImage,
  type DineInCategory,
  type DineInItem,
} from "@/lib/dinein-db";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, resolveProductImageUrl } from "@/lib/products-db";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

export function DineInItemForm({
  item,
  categories,
  onClose,
  onSaved,
}: {
  item: DineInItem | null;
  categories: DineInCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [categoryId, setCategoryId] = useState(item?.category_id ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [imagePath, setImagePath] = useState<string | null>(item?.image_url ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    void resolveProductImageUrl(imagePath).then((url) => {
      if (!cancelled) setPreview(url);
    });
    return () => {
      cancelled = true;
    };
  }, [file, imagePath]);

  function handleFile(selected: File | undefined) {
    if (!selected) return;
    if (!ALLOWED_IMAGE_TYPES.includes(selected.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      toast.error("Imagem muito grande. Máximo de 5 MB.");
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Informe o nome do item.");
      return;
    }
    if (!categoryId) {
      toast.error("Crie uma categoria antes de cadastrar itens.");
      return;
    }
    const parsedPrice = Number(price.replace(",", "."));
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Preço inválido.");
      return;
    }

    setSaving(true);
    try {
      let finalImage = imagePath;
      if (file) finalImage = await uploadDineInImage(file);

      await saveDineInItem({
        id: item?.id,
        category_id: categoryId,
        name: trimmedName,
        description: description.trim() || null,
        price: parsedPrice,
        image_url: finalImage,
        available,
        featured,
      });

      toast.success(item ? "Item atualizado." : "Item criado.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            {item ? "Editar item do cardápio" : "Novo item do cardápio"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg border border-border p-2 text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              required
              className={inputClass}
            />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Categoria</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Preço (R$)</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className={inputClass}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Descrição (opcional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className={inputClass}
            />
          </label>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Imagem</span>
            <div className="mt-2 flex items-center gap-4">
              {preview ? (
                <img src={preview} alt="Pré-visualização" className="h-20 w-20 rounded-xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="text-sm text-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WEBP — até 5 MB.</p>
                {(file || imagePath) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setImagePath(null);
                    }}
                    className="mt-2 text-xs font-semibold text-destructive"
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-foreground">Disponível</span>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-foreground">Destaque / mais pedido</span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar item"}
          </button>
        </div>
      </form>
    </div>
  );
}
