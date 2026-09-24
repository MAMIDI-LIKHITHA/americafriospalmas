import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "@/lib/lovable-error-reporting";

function UnavailablePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-20">
      <section className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-2xl font-bold">A</span>
        </div>
        <p className="mt-8 text-sm font-bold tracking-[0.2em] text-primary uppercase">
          América Frios
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
          Website Temporarily Unavailable
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
          This website is temporarily unavailable at the moment.
          Please check back again later.
        </p>
        <div className="mx-auto mt-8 h-px w-24 bg-border" />
        <p className="mt-6 text-sm text-muted-foreground">
          Thank you for your understanding.
        </p>
      </section>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  console.error(error);
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return <UnavailablePage />;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "América Frios | Website Temporarily Unavailable" },
      {
        name: "description",
        content: "This website is temporarily unavailable.",
      },
      { name: "author", content: "América Frios" },
      { property: "og:site_name", content: "América Frios" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <UnavailablePage />;
}
