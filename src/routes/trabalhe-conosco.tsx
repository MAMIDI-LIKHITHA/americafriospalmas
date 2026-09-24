import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Briefcase, Send, Info, MapPin, CheckCircle2 } from "lucide-react";

import { fetchPublicJobOpenings, type JobOpening } from "@/lib/jobs-db";
import { WHATSAPP_NUMBERS, waLinkFor } from "@/lib/site";

const description =
  "Confira oportunidades de trabalho na América Frios e envie sua candidatura diretamente pelo WhatsApp.";

const POSITIONS = [
  "Produção",
  "Atendimento",
  "Vendas",
  "Entrega / Logística",
  "Administrativo",
  "Outro",
] as const;

type Position = (typeof POSITIONS)[number];

function openingMessage(o: JobOpening) {
  const lines = [
    "Olá, América Frios! Gostaria de me candidatar à vaga abaixo.",
    "",
    `Cargo: ${o.title}`,
    `Loja: ${[o.store, o.city].filter(Boolean).join(" — ")}`,
    "",
    "Estou enviando meu currículo em PDF/anexo nesta conversa.",
  ];
  return lines.join("\n");
}

function buildMessage(data: {
  name: string;
  phone: string;
  email: string;
  city: string;
  position: Position;
  experience: string;
  message: string;
}) {
  const lines = [
    "Olá, América Frios! Gostaria de me candidatar a uma oportunidade de trabalho.",
    "",
    `Nome: ${data.name}`,
    `WhatsApp: ${data.phone}`,
    ...(data.email ? [`E-mail: ${data.email}`] : []),
    `Cidade: ${data.city}`,
    `Cargo de interesse: ${data.position}`,
    "",
    "Experiência profissional:",
    data.experience || "—",
    "",
    "Mensagem:",
    data.message || "—",
    "",
    "Estou enviando meu currículo em PDF/anexo nesta conversa.",
  ];
  return lines.join("\n");
}

export const Route = createFileRoute("/trabalhe-conosco")({
  head: () => ({
    meta: [
      { title: "Trabalhe Conosco | América Frios" },
      { name: "description", content: description },
      { property: "og:title", content: "Trabalhe Conosco | América Frios" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/trabalhe-conosco" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/trabalhe-conosco" }],
  }),
  component: TrabalheConoscoPage,
});

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && (
        <span className="mt-1 block text-xs font-medium text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

function TrabalheConoscoPage() {
  const openingsQuery = useQuery({
    queryKey: ["public-job-openings"],
    queryFn: fetchPublicJobOpenings,
  });
  const openings = openingsQuery.data ?? [];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [position, setPosition] = useState<Position | "">("");
  const [experience, setExperience] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const errors = {
    name: name.trim().length < 3 ? "Informe seu nome completo" : "",
    phone: phone.trim().length < 8 ? "Informe um telefone com DDD" : "",
    city: city.trim().length < 2 ? "Informe sua cidade" : "",
    position: !position ? "Selecione o cargo de interesse" : "",
  };

  const isValid = !errors.name && !errors.phone && !errors.city && !errors.position;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    const text = buildMessage({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      position: position as Position,
      experience: experience.trim(),
      message: message.trim(),
    });
    const url = waLinkFor(WHATSAPP_NUMBERS[0].intl, text);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-charcoal">
        <div className="absolute inset-0 bg-primary/20" />
        <div className="container-page relative py-16 md:py-24">
          <p className="font-display text-sm font-semibold tracking-widest text-cream/70 uppercase">
            Carreiras
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
            Trabalhe Conosco
          </h1>
          <p className="mt-3 font-display text-lg font-semibold text-accent">
            Faça parte da equipe América Frios
          </p>
          <p className="mt-4 max-w-2xl text-base text-cream/80 md:text-lg">
            Estamos sempre em busca de pessoas comprometidas e responsáveis para fazer parte da
            nossa equipe. Confira as oportunidades e envie seus dados para nós.
          </p>
        </div>
      </section>

      {/* Vagas abertas */}
      <section className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </span>
            <div>
              <h2 className="font-display text-xl">Vagas abertas</h2>
              <p className="text-sm text-muted-foreground">
                Confira as oportunidades disponíveis e candidate-se pelo WhatsApp.
              </p>
            </div>
          </div>

          {openingsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando vagas...</p>
          ) : openings.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No momento não há vagas abertas, mas você pode enviar sua candidatura pelo
              formulário abaixo — entraremos em contato quando surgir uma oportunidade.
            </p>
          ) : (
          <div className="space-y-5">
            {openings.map((o) => {
              const requirements = o.requirements
                .split("\n")
                .map((r) => r.trim())
                .filter(Boolean);
              return (
                <article
                  key={o.id}
                  className="card-surface overflow-hidden p-6 md:p-8"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                      Vaga aberta
                    </span>
                    <h3 className="font-display text-lg text-foreground">{o.title}</h3>
                  </div>

                  {(o.store || o.city) && (
                    <div className="mt-4 flex items-start gap-2 text-sm text-foreground/80">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {o.store && (
                          <span className="font-semibold text-foreground">{o.store}</span>
                        )}
                        {o.store && o.city && " — "}
                        {o.city}
                      </span>
                    </div>
                  )}

                  {requirements.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Requisitos
                      </p>
                      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                        {requirements.map((r) => (
                          <li key={r} className="flex items-start gap-2 text-sm text-foreground/85">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {o.note && (
                    <p className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm font-semibold text-foreground">
                      📍 {o.note}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href={waLinkFor(o.whatsapp_intl, openingMessage(o))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-base btn-whatsapp text-base"
                    >
                      <Send className="h-4 w-4" /> Candidatar-se — {o.whatsapp_display}
                    </a>
                    <span className="text-xs text-muted-foreground">
                      ou preencha o formulário abaixo.
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* Formulário */}
      <section className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </span>
            <div>
              <h2 className="font-display text-xl">Formulário de candidatura</h2>
              <p className="text-sm text-muted-foreground">
                Preencha seus dados e envie pelo WhatsApp junto com seu currículo.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card-surface space-y-5 p-6 md:p-8" noValidate>
            <Field label="Nome completo" required error={touched ? errors.name : ""}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                className="input-field"
                placeholder="Seu nome completo"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="WhatsApp / Telefone" required error={touched ? errors.phone : ""}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  className="input-field"
                  placeholder="(63) 9XXXX-XXXX"
                />
              </Field>

              <Field label="E-mail">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                  className="input-field"
                  placeholder="voce@email.com"
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Cidade" required error={touched ? errors.city : ""}>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={80}
                  className="input-field"
                  placeholder="Palmas - TO"
                />
              </Field>

              <Field label="Cargo de interesse" required error={touched ? errors.position : ""}>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as Position | "")}
                  className="input-field"
                >
                  <option value="">Selecione…</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Experiência profissional">
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                maxLength={1000}
                rows={4}
                className="input-field resize-y"
                placeholder="Resuma sua experiência, cargos anteriores e tempo de atuação."
              />
            </Field>

            <Field label="Mensagem / Apresentação">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                rows={4}
                className="input-field resize-y"
                placeholder="Conte um pouco sobre você e por que quer trabalhar conosco."
              />
            </Field>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/85">
              <p className="flex items-start gap-2 font-semibold">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Após abrir o WhatsApp, envie seu currículo em PDF como anexo junto com a mensagem.
              </p>
            </div>

            <button
              type="submit"
              className="btn-base btn-whatsapp w-full text-base md:w-auto"
            >
              <Send className="h-4 w-4" /> Enviar candidatura pelo WhatsApp
            </button>

            <p className="text-xs text-muted-foreground">
              Seu currículo será enviado diretamente pelo WhatsApp. Não armazenamos currículos no
              site.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
