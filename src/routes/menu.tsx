import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { dineInMenuQueryOptions } from "@/lib/dinein";
import { brl } from "@/lib/order";

const description =
  "Cardápio do salão América Frios Palmas: espetinhos, porções e bebidas para consumo no local, com fotos, descrições e preços atualizados.";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Cardápio do Salão | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Cardápio do Salão | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dineInMenuQueryOptions),
  component: MenuPage,
  errorComponent: MenuError,
  notFoundComponent: MenuError,
});

function MenuError() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="font-display text-2xl">Não foi possível carregar o cardápio</h1>
      <p className="mt-3 text-muted-foreground">
        Atualize a página em alguns instantes ou fale conosco no WhatsApp.
      </p>
      <WhatsAppButton className="mt-6" />
    </div>
  );
}

function MenuPage() {
  const { data: categories } = useSuspenseQuery(dineInMenuQueryOptions);
  const visible = categories.filter((c) => c.items.length > 0);

  return (
    <div className="container-page py-10 md:py-14">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">Consumo no local</p>
      <h1 className="mt-2 max-w-3xl font-display text-3xl md:text-4xl">Cardápio do Salão</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Itens preparados para consumo na loja. Os preços e produtos do cardápio são
        independentes da nossa loja online de entrega e retirada.
      </p>

      {visible.length > 1 && (
        <nav className="mt-6 flex flex-wrap gap-2">
          {visible.map((c) => (
            <a
              key={c.id}
              href={`#${c.slug}`}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {c.name}
            </a>
          ))}
        </nav>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          O cardápio do salão está sendo montado. Em breve você encontra tudo por aqui.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {visible.map((category) => (
            <section key={category.id} id={category.slug} className="scroll-mt-24">
              <h2 className="font-display text-2xl md:text-3xl">{category.name}</h2>
              {category.description && (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {category.description}
                </p>
              )}

              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <li
                    key={item.id}
                    className={`flex gap-4 rounded-2xl border border-border bg-card p-4 ${
                      item.available ? "" : "opacity-60"
                    }`}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        {item.featured && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            <Star className="h-3 w-3" /> Destaque
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <p className="mt-2 font-display text-lg tabular-nums text-foreground">
                        {brl(item.price)}
                      </p>
                      {!item.available && (
                        <span className="mt-2 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          Indisponível hoje
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
