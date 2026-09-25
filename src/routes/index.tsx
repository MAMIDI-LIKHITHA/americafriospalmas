import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star, Store, MessageCircle, PackageCheck, Sparkles, Utensils, Instagram } from "lucide-react";

import { CategoryCard } from "@/components/CategoryCard";
import { StoreCard } from "@/components/StoreCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { catalogQueryOptions } from "@/lib/catalog";
import { STORES, localBusinessSchema } from "@/lib/site";
import heroImg from "@/assets/Homepage.png";
import localImg from "@/assets/loja-interior.jpg";
import varietyImg from "@/assets/deli-variety.png";

const description =
  "América Frios em Palmas: frios, queijos, carnes, embutidos e outros produtos para sua casa ou negócio.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Início | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://americafriospalmas.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://americafriospalmas.lovable.app/" }],
    scripts: localBusinessSchema().map((schema) => ({
      type: "application/ld+json",
      children: JSON.stringify(schema),
    })),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  component: Index,
  errorComponent: HomeError,
  notFoundComponent: HomeError,
});

function HomeError() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="font-display text-2xl">Não foi possível carregar a página</h1>
      <p className="mt-3 text-muted-foreground">
        Atualize a página em alguns instantes ou fale conosco no WhatsApp.
      </p>
      <WhatsAppButton className="mt-6" />
    </div>
  );
}

const EXPERIENCES = [
  { icon: PackageCheck, title: "Para sua casa ou negócio", text: "Opções para compras do dia a dia e abastecimento." },
  { icon: Sparkles, title: "Frios e especialidades", text: "Queijos, presuntos, salames, carnes, embutidos e mais." },
  { icon: Utensils, title: "Consumo no local", text: "Confira as opções disponíveis para aproveitar na loja." },
  { icon: MessageCircle, title: "Atendimento pelo WhatsApp", text: "Consulte disponibilidade, pedidos e informações." },
];

function Index() {
  const { data: categories } = useSuspenseQuery(catalogQueryOptions);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImg}
          alt="América Frios — produtos e atendimento em Palmas"
          width={1536}
          height={864}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/35 to-transparent" />
        <div className="container-page relative py-16 md:py-24">
          <p className="font-display text-sm font-semibold tracking-widest text-cream/70 uppercase">
            Palmas - TO · Loja física e pedidos
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
            Frios, carnes e especialidades para sua mesa
          </h1>
          <p className="mt-5 max-w-2xl text-base text-cream/80 md:text-lg">
            Explore o catálogo, monte seu pedido e fale com nossa equipe pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/produtos" className="btn-base btn-brand px-6 py-3.5 text-base">
              Ver Produtos
            </Link>
            <WhatsAppButton size="lg" label="Falar no WhatsApp" />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-10">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIENCES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Categorias</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">Escolha por categoria</h2>
          </div>
          <Link to="/produtos" className="text-sm font-semibold text-primary hover:underline">
            Ver catálogo completo →
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Veja os principais grupos de produtos e acesse o catálogo para montar seu pedido.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.name} category={c} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/60 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <img src={localImg} alt="Espaço da América Frios para consumo no local" loading="lazy" className="aspect-4/3 w-full rounded-lg object-cover" />
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Experiência na loja</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">Consumo no local</h2>
            <p className="mt-4 text-muted-foreground">
              Veja as opções disponíveis para consumo no local e consulte nossa equipe sobre horários e disponibilidade.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <WhatsAppButton label="Fale Conosco" message="Olá! Gostaria de saber mais sobre o consumo no local da América Frios." />
              <Link to="/menu" className="btn-base btn-outline-brand">Ver opções para consumo</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Novidades</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">Acompanhe a América Frios</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Veja produtos, novidades e conteúdos no perfil oficial do Instagram.
            </p>
            <a href="https://www.instagram.com/americafriospalmas/" target="_blank" rel="noopener noreferrer" className="btn-base btn-brand mt-6"><Instagram className="h-4 w-4" /> Ver Instagram</a>
          </div>
          <img src={varietyImg} alt="Variedade de produtos alimentícios da América Frios" loading="lazy" className="aspect-16/9 w-full rounded-lg object-cover" />
        </div>
      </section>

      <section className="border-t border-border bg-secondary/60 py-16">
        <div className="container-page">
          <p className="text-sm font-bold tracking-widest text-primary uppercase">Nossas lojas</p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">Encontre uma loja</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {STORES.map((s) => (
              <StoreCard key={s.slug} store={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-2xl md:text-3xl">
            Precisa de ajuda com seu pedido?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85">
            Fale com nossa equipe para confirmar disponibilidade, entrega ou retirada.
          </p>
          <WhatsAppButton size="lg" className="mt-7 justify-center" />
        </div>
      </section>
    </div>
  );
}
