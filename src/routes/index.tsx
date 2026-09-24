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
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-6 py-20">
      <section className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Store className="h-8 w-8" />
        </div>
        <p className="mt-8 text-sm font-bold tracking-[0.2em] text-primary uppercase">
          América Frios
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
          Site temporariamente indisponível
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
          Este site está temporariamente indisponível no momento.
          Por favor, tente novamente mais tarde.
        </p>
        <div className="mx-auto mt-8 h-px w-24 bg-border" />
        <p className="mt-6 text-sm text-muted-foreground">
          Agradecemos a sua compreensão.
        </p>
      </section>
    </div>
  );
}
