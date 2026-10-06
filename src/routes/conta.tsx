import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Package, RefreshCw, Save, UserRound } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/order";
import { STATUS_LABELS, type OrderStatus } from "@/lib/orders-db";

type Profile = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
};

type CustomerOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfillment_type: string;
  delivery_address: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export const Route = createFileRoute("/conta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Minha Conta | América Frios Palmas" },
      { name: "description", content: "Acesse sua conta, acompanhe seus pedidos e consulte seu histórico na América Frios." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContaPage,
});

function ContaPage() {
  const navigate = useNavigate();
  const { add, clear } = useCart();
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setSessionReady(true);
      if (data.session) await loadAccount(data.session.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setSessionReady(true);
      if (nextSession) await loadAccount(nextSession.user.id);
      else {
        setProfile(null);
        setOrders([]);
        setItems([]);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadAccount(userId: string) {
    setLoading(true);
    const [{ data: profileData, error: profileError }, { data: orderData, error: orderError }] =
      await Promise.all([
        supabase.from("profiles").select("id,name,phone,address").eq("id", userId).maybeSingle(),
        supabase.from("orders").select("id,order_number,customer_name,customer_phone,customer_email,fulfillment_type,delivery_address,subtotal,delivery_fee,total,status,notes,created_at").eq("customer_id", userId).order("created_at", { ascending: false }),
      ]);

    if (profileError) toast.error("Não foi possível carregar seu perfil.");
    if (orderError) toast.error("Não foi possível carregar seus pedidos.");
    setProfile((profileData as Profile | null) ?? { id: userId, name: "", phone: "", address: "" });
    const nextOrders = (orderData ?? []) as CustomerOrder[];
    setOrders(nextOrders);

    if (nextOrders.length) {
      const { data: itemData } = await supabase
        .from("order_items")
        .select("id,order_id,product_id,product_name,quantity,unit_price,subtotal")
        .in("order_id", nextOrders.map((o) => o.id))
        .order("created_at", { ascending: true });
      setItems((itemData ?? []) as OrderItem[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  }

  async function saveProfile() {
    if (!session || !profile) return;
    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      address: profile.address?.trim() || null,
    });
    if (error) toast.error("Não foi possível salvar seus dados.");
    else toast.success("Dados atualizados.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Você saiu da sua conta.");
  }

  async function authenticate(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setMessage("");
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    const result =
      authMode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { name, phone } } });

    setAuthLoading(false);
    if (result.error) {
      toast.error(result.error.message.includes("Invalid login") ? "E-mail ou senha incorretos." : result.error.message);
      return;
    }

    if (authMode === "signup" && !result.data.session) {
      setMessage("Conta criada. Verifique seu e-mail para confirmar a conta e depois entre.");
      setAuthMode("login");
      return;
    }

    toast.success(authMode === "login" ? "Bem-vindo de volta!" : "Conta criada com sucesso!");
  }

  function reorder(orderId: string) {
    const orderItems = items.filter((item) => item.order_id === orderId && item.product_id);
    if (!orderItems.length) {
      toast.error("Os produtos deste pedido não estão mais disponíveis para repetir.");
      return;
    }
    clear();
    for (const item of orderItems) add(item.product_id!, item.quantity);
    toast.success("Itens adicionados ao carrinho.");
    navigate({ to: "/carrinho" });
  }

  if (!sessionReady || loading) {
    return <div className="container-page py-16 text-center text-muted-foreground">Carregando sua conta…</div>;
  }

  const itemCount = new Map<string, number>();
  for (const item of items) itemCount.set(item.order_id, (itemCount.get(item.order_id) ?? 0) + item.quantity);

  if (!session) {
    return <AuthCard mode={authMode} setMode={setAuthMode} loading={authLoading} message={message} onSubmit={authenticate} />;
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">Minha conta</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Olá, {profile?.name || session.user.email?.split("@")[0]}!</h1>
          <p className="mt-2 text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <button type="button" onClick={signOut} className="btn-base btn-outline-brand">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="card-surface h-fit p-5">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Meus dados</h2>
          </div>
          <label className="mt-5 block text-sm font-semibold">Nome completo
            <input className="input-field mt-1.5" value={profile?.name ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, name: e.target.value } : p)} />
          </label>
          <label className="mt-4 block text-sm font-semibold">WhatsApp
            <input className="input-field mt-1.5" value={profile?.phone ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, phone: e.target.value } : p)} />
          </label>
          <label className="mt-4 block text-sm font-semibold">Endereço padrão
            <textarea className="input-field mt-1.5" rows={3} value={profile?.address ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, address: e.target.value } : p)} placeholder="Quadra, rua, número, complemento..." />
          </label>
          <button type="button" onClick={saveProfile} className="btn-base btn-brand mt-5 w-full">
            <Save className="h-4 w-4" /> Salvar dados
          </button>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Meus pedidos</h2>
              <p className="mt-1 text-sm text-muted-foreground">Todos os pedidos feitos com esta conta ficam aqui.</p>
            </div>
            <Package className="h-7 w-7 text-primary" />
          </div>

          {orders.length === 0 ? (
            <div className="card-surface mt-5 p-8 text-center">
              <p className="font-semibold">Você ainda não fez nenhum pedido.</p>
              <button type="button" onClick={() => navigate({ to: "/produtos" })} className="btn-base btn-brand mt-4">Ver produtos</button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="card-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("pt-BR")} · {itemCount.get(order.id) ?? 0} itens
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{STATUS_LABELS[order.status] ?? order.status}</span>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    {items.filter((item) => item.order_id === order.id).map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm">
                        <span>{item.quantity} × {item.product_name}</span>
                        <span className="font-semibold">{brl(Number(item.subtotal))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="ml-2 font-display text-xl font-bold">{brl(Number(order.total))}</span>
                    </div>
                    <button type="button" onClick={() => reorder(order.id)} className="btn-base btn-outline-brand">
                      <RefreshCw className="h-4 w-4" /> Comprar novamente
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AuthCard({
  mode, setMode, loading, message, onSubmit,
}: {
  mode: "login" | "signup";
  setMode: (mode: "login" | "signup") => void;
  loading: boolean;
  message: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card-surface w-full max-w-md p-6 md:p-8">
        <div className="flex items-center gap-3">
          <UserRound className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">{mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acompanhe seus pedidos como em um app de delivery.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          {mode === "signup" && (
            <>
              <label className="block text-sm font-semibold">Nome completo
                <input name="name" required minLength={3} className="input-field mt-1.5" autoComplete="name" />
              </label>
              <label className="mt-4 block text-sm font-semibold">WhatsApp
                <input name="phone" required minLength={10} className="input-field mt-1.5" autoComplete="tel" />
              </label>
            </>
          )}
          <label className="mt-4 block text-sm font-semibold">E-mail
            <input name="email" type="email" required className="input-field mt-1.5" autoComplete="email" />
          </label>
          <label className="mt-4 block text-sm font-semibold">Senha
            <input name="password" type="password" required minLength={6} className="input-field mt-1.5" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </label>
          {message && <p className="mt-4 rounded-xl bg-secondary p-3 text-sm text-foreground">{message}</p>}
          <button type="submit" disabled={loading} className="btn-base btn-brand mt-5 w-full disabled:opacity-60">
            {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-5 w-full text-sm font-semibold text-primary hover:underline">
          {mode === "login" ? "Ainda não tenho conta → Criar conta" : "Já tenho uma conta → Entrar"}
        </button>
      </div>
    </div>
  );
}
