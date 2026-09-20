import { Phone, Mail, Instagram, Facebook, MapPin } from "lucide-react";

import { createFileRoute } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CONTACT, STORES, mapDirections } from "@/lib/site";

const description =
  "Fale com a América Frios Palmas pelo WhatsApp, e-mail ou visite uma de nossas lojas em Palmas - TO.";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Contato | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://americafriospalmas.lovable.app/contato" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://americafriospalmas.lovable.app/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <div className="container-page py-14">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">Contato</p>
      <h1 className="mt-2 max-w-3xl font-display text-3xl md:text-4xl">
        Fale com a América Frios
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Entre em contato pelo WhatsApp, telefone ou e-mail, ou escolha uma de nossas lojas para
        ver o endereço e as orientações de chegada.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card-surface space-y-5 p-6">
          <h2 className="font-display text-xl">Canais de atendimento</h2>

          <div className="space-y-2">
            {CONTACT.phoneDisplays.map((p, i) => (
              <a
                key={p}
                href={`tel:${CONTACT.phonesTel[i]}`}
                className="flex items-center gap-3 text-sm font-semibold hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" /> {p}
              </a>
            ))}
          </div>

          <a
            href={`mailto:${CONTACT.email}`}
            className="flex items-center gap-3 text-sm font-semibold break-all hover:text-primary"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" /> {CONTACT.email}
          </a>

          <a
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm font-semibold hover:text-primary"
          >
            <Instagram className="h-4 w-4 text-primary" /> {CONTACT.instagramHandle}
          </a>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-outline-brand px-4 py-2 text-sm"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-outline-brand px-4 py-2 text-sm"
            >
              <Facebook className="h-4 w-4" /> Facebook
            </a>
          </div>

          <WhatsAppButton size="lg" block />

          <p className="rounded-lg bg-secondary p-4 text-sm text-secondary-foreground">
            Para pedidos, disponibilidade ou dúvidas sobre consumo no local, fale com nossa equipe
            pelo WhatsApp.
          </p>
        </div>

        <div className="card-surface space-y-5 p-6">
          <h2 className="font-display text-xl">Nossas lojas</h2>

          {STORES.map((s) => (
            <div key={s.slug} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display font-bold">
                  {s.name}
                  {s.badge ? ` — ${s.badge}` : ""}
                </p>
                <a
                  href={`tel:+${s.phoneIntl}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {s.phoneDisplay}
                </a>
              </div>

              <p className="mt-2 flex gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {s.street} — {s.district}, {s.city}, {s.postal}
                </span>
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Segunda a sábado: 08:00–20:00 · Domingo: 08:00–13:00
              </p>

              <a
                href={mapDirections(s.mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Como Chegar →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
