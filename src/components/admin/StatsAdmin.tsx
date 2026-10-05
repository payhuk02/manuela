import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  RefreshCw,
  Inbox,
  Newspaper,
  Sparkles,
  Users,
  MessageCircle,
  Heart,
  TrendingUp,
  Eye,
} from "lucide-react";

type ContactRow = {
  id: string;
  status: string;
  lang: string;
  expertise_slug: string | null;
  created_at: string;
};

type ArticleRow = {
  id: string;
  title: string;
  published: boolean;
  content_type: string;
  lang: string;
  created_at: string;
};

type ChatRow = {
  id: string;
  status: string;
  lang: string;
  message_count: number;
  created_at: string;
};

type InteractionRow = {
  article_id: string | null;
  likes_count: number | null;
  shares_count: number | null;
  comments_count: number | null;
};

type ExpertiseRow = { id: string; published: boolean };
type TeamRow = { id: string; published: boolean };
type LandingRow = { id: string; published: boolean };

type VisitStats = {
  total_visits: number;
  total_visitors: number;
  visits_month: number;
  visitors_month: number;
  visits_window: number;
  visitors_window: number;
  daily: { date: string; count: number }[];
  top_paths: { path: string; count: number }[];
};

const EMPTY_VISITS: VisitStats = {
  total_visits: 0,
  total_visitors: 0,
  visits_month: 0,
  visitors_month: 0,
  visits_window: 0,
  visitors_window: 0,
  daily: [],
  top_paths: [],
};

const DAYS = 30;

const contactsChartConfig = {
  count: { label: "Demandes", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const visitsChartConfig = {
  count: { label: "Visites", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const engagementChartConfig = {
  likes: { label: "J'aime", color: "hsl(var(--primary))" },
  shares: { label: "Partages", color: "hsl(220 70% 45%)" },
  comments: { label: "Commentaires", color: "hsl(160 45% 40%)" },
} satisfies ChartConfig;

const statusChartConfig = {
  new: { label: "Nouvelles", color: "hsl(var(--primary))" },
  read: { label: "Lues", color: "hsl(220 70% 45%)" },
  archived: { label: "Archivées", color: "hsl(160 45% 40%)" },
  other: { label: "Autres", color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig;

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(220 70% 45%)",
  "hsl(160 45% 40%)",
  "hsl(30 70% 50%)",
  "hsl(280 40% 50%)",
  "hsl(var(--muted-foreground))",
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDayLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function buildLastDaysSeries(rows: { created_at: string }[], days: number) {
  const map = new Map<string, number>();
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dayKey(d.toISOString());
    map.set(key, 0);
  }
  for (const row of rows) {
    const key = dayKey(row.created_at);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([date, count]) => ({
    date,
    label: formatDayLabel(date),
    count,
  }));
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: typeof Inbox;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-serif text-primary tabular-nums">{value}</div>
        {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function StatsAdmin() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [interactions, setInteractions] = useState<InteractionRow[]>([]);
  const [expertises, setExpertises] = useState<ExpertiseRow[]>([]);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [landings, setLandings] = useState<LandingRow[]>([]);
  const [visits, setVisits] = useState<VisitStats>(EMPTY_VISITS);
  const [visitsReady, setVisitsReady] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const queries: PromiseLike<{ error: { message: string } | null; data: unknown; key: string }>[] = [
      supabase
        .from("news_articles")
        .select("id, title, published, content_type, lang, created_at")
        .then((r) => ({ ...r, key: "articles" })),
      supabase
        .from("expertises")
        .select("id, published")
        .then((r) => ({ ...r, key: "expertises" })),
      supabase
        .from("team_members")
        .select("id, published")
        .then((r) => ({ ...r, key: "team" })),
      supabase
        .from("landing_pages")
        .select("id, published")
        .then((r) => ({ ...r, key: "landings" })),
      supabase
        .from("chat_conversations")
        .select("id, status, lang, message_count, created_at")
        .then((r) => ({ ...r, key: "chats" })),
      supabase
        .from("article_interaction_counts")
        .select("article_id, likes_count, shares_count, comments_count")
        .then((r) => ({ ...r, key: "interactions" })),
      (supabase as any)
        .rpc("get_site_visit_stats", { _days: DAYS })
        .then((r: { error: { message: string } | null; data: unknown }) => ({
          ...r,
          key: "visits",
        })),
    ];

    if (isAdmin) {
      queries.push(
        (supabase as any)
          .from("contact_messages")
          .select("id, status, lang, expertise_slug, created_at")
          .then((r: { error: { message: string } | null; data: unknown }) => ({
            ...r,
            key: "contacts",
          })),
      );
    }

    const results = await Promise.all(queries);
    setLoading(false);

    const errors = results.filter((r) => r.error && r.key !== "visits");
    if (errors.length) {
      toast.error(errors[0].error!.message);
    }
    const visitsResult = results.find((r) => r.key === "visits");
    setVisitsReady(!visitsResult?.error);

    for (const r of results) {
      if (r.error) continue;
      switch (r.key) {
        case "articles":
          setArticles((r.data as ArticleRow[]) ?? []);
          break;
        case "expertises":
          setExpertises((r.data as ExpertiseRow[]) ?? []);
          break;
        case "team":
          setTeam((r.data as TeamRow[]) ?? []);
          break;
        case "landings":
          setLandings((r.data as LandingRow[]) ?? []);
          break;
        case "chats":
          setChats((r.data as ChatRow[]) ?? []);
          break;
        case "interactions":
          setInteractions((r.data as InteractionRow[]) ?? []);
          break;
        case "contacts":
          setContacts((r.data as ContactRow[]) ?? []);
          break;
        case "visits": {
          const raw = r.data as VisitStats | null;
          setVisits(
            raw
              ? {
                  ...EMPTY_VISITS,
                  ...raw,
                  daily: Array.isArray(raw.daily) ? raw.daily : [],
                  top_paths: Array.isArray(raw.top_paths) ? raw.top_paths : [],
                }
              : EMPTY_VISITS,
          );
          break;
        }
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const contactsThisMonth = contacts.filter((c) => new Date(c.created_at) >= monthStart).length;
  const contactsNew = contacts.filter((c) => c.status === "new").length;
  const articlesPublished = articles.filter((a) => a.published).length;
  const expertisesPublished = expertises.filter((e) => e.published).length;
  const teamPublished = team.filter((t) => t.published).length;
  const landingsPublished = landings.filter((l) => l.published).length;
  const chatsOpen = chats.filter((c) => c.status === "open").length;
  const chatMessagesTotal = chats.reduce((sum, c) => sum + (c.message_count || 0), 0);

  const engagementTotals = useMemo(() => {
    return interactions.reduce(
      (acc, row) => {
        acc.likes += row.likes_count ?? 0;
        acc.shares += row.shares_count ?? 0;
        acc.comments += row.comments_count ?? 0;
        return acc;
      },
      { likes: 0, shares: 0, comments: 0 },
    );
  }, [interactions]);

  const contactsSeries = useMemo(() => buildLastDaysSeries(contacts, DAYS), [contacts]);
  const chatsSeries = useMemo(() => buildLastDaysSeries(chats, DAYS), [chats]);
  const visitsSeries = useMemo(
    () =>
      (visits.daily ?? []).map((d) => ({
        date: d.date,
        label: formatDayLabel(d.date),
        count: d.count,
      })),
    [visits.daily],
  );
  const topPaths = useMemo(
    () =>
      (visits.top_paths ?? []).map((p) => ({
        name: p.path.length > 32 ? `${p.path.slice(0, 32)}…` : p.path,
        value: p.count,
      })),
    [visits.top_paths],
  );

  const contactStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of contacts) {
      const key = ["new", "read", "archived"].includes(c.status) ? c.status : "other";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts).map(([status, value]) => ({
      status,
      value,
      label: statusChartConfig[status as keyof typeof statusChartConfig]?.label ?? status,
    }));
  }, [contacts]);

  const contactExpertiseData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of contacts) {
      const key = c.expertise_slug?.trim() || "général";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [contacts]);

  const topArticles = useMemo(() => {
    const byId = new Map(articles.map((a) => [a.id, a]));
    return interactions
      .map((row) => {
        const article = row.article_id ? byId.get(row.article_id) : undefined;
        const likes = row.likes_count ?? 0;
        const shares = row.shares_count ?? 0;
        const comments = row.comments_count ?? 0;
        return {
          id: row.article_id ?? "",
          title: article?.title ?? "Article inconnu",
          likes,
          shares,
          comments,
          total: likes + shares + comments,
        };
      })
      .filter((a) => a.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [interactions, articles]);

  const contentBreakdown = useMemo(() => {
    const news = articles.filter((a) => a.content_type === "news").length;
    const article = articles.filter((a) => a.content_type === "article").length;
    const other = articles.length - news - article;
    return [
      { name: "Actualités", value: news },
      { name: "Articles", value: article },
      ...(other > 0 ? [{ name: "Autres", value: other }] : []),
    ].filter((x) => x.value > 0);
  }, [articles]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl text-primary">Statistiques</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d’ensemble de l’activité du site : visites, contacts, contenus et engagement.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {!visitsReady ? (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Le compteur de visites sera actif après application de la migration SQL
          <code className="mx-1 text-xs">site_page_views</code>
          dans le projet Supabase (SQL Editor).
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard
          title="Visites du site"
          value={visits.total_visits}
          hint={`${visits.visits_month} ce mois · ${visits.total_visitors} visiteurs uniques`}
          icon={Eye}
        />
        {isAdmin ? (
          <KpiCard
            title="Demandes de contact"
            value={contacts.length}
            hint={`${contactsThisMonth} ce mois · ${contactsNew} nouvelles`}
            icon={Inbox}
          />
        ) : null}
        <KpiCard
          title="Articles publiés"
          value={articlesPublished}
          hint={`${articles.length} au total`}
          icon={Newspaper}
        />
        <KpiCard
          title="Expertises"
          value={expertisesPublished}
          hint={`${expertises.length} fiches`}
          icon={Sparkles}
        />
        <KpiCard
          title="Équipe"
          value={teamPublished}
          hint={`${team.length} membres · ${landingsPublished} pages géo`}
          icon={Users}
        />
        <KpiCard
          title="Conversations chat"
          value={chats.length}
          hint={`${chatsOpen} ouvertes · ${chatMessagesTotal} messages`}
          icon={MessageCircle}
        />
        <KpiCard
          title="Engagement articles"
          value={engagementTotals.likes + engagementTotals.shares + engagementTotals.comments}
          hint={`${engagementTotals.likes} ♥ · ${engagementTotals.shares} partages · ${engagementTotals.comments} com.`}
          icon={Heart}
        />
        <KpiCard
          title="Contenus actifs"
          value={articlesPublished + expertisesPublished + landingsPublished}
          hint="Articles + expertises + pages géo"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Visites — 30 derniers jours</CardTitle>
            <CardDescription>
              Pages vues anonymisées ({visits.visits_window} visites · {visits.visitors_window} visiteurs).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={visitsChartConfig} className="aspect-[16/9] w-full">
              <AreaChart data={visitsSeries} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">Demandes — 30 derniers jours</CardTitle>
              <CardDescription>Messages reçus via les formulaires de contact.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={contactsChartConfig} className="aspect-[16/9] w-full">
                <AreaChart data={contactsSeries} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    fill="var(--color-count)"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Chat — 30 derniers jours</CardTitle>
            <CardDescription>Nouvelles conversations du chatbot.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={contactsChartConfig} className="aspect-[16/9] w-full">
              <AreaChart data={chatsSeries} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {isAdmin && contactStatusData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">Statut des demandes</CardTitle>
              <CardDescription>Répartition new / lues / archivées.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={statusChartConfig} className="aspect-[16/9] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                  <Pie data={contactStatusData} dataKey="value" nameKey="status" innerRadius={55} outerRadius={90}>
                    {contactStatusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : null}

        {contentBreakdown.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">Types de contenus</CardTitle>
              <CardDescription>Actualités vs articles d’analyse.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: { label: "Contenus", color: "hsl(var(--primary))" },
                }}
                className="aspect-[16/9] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={contentBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {contentBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : null}

        {isAdmin && contactExpertiseData.length > 0 ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">Demandes par expertise</CardTitle>
              <CardDescription>Origine des formulaires (slug d’expertise ou contact général).</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ value: { label: "Demandes", color: "hsl(var(--primary))" } }}
                className="aspect-[21/9] w-full"
              >
                <BarChart data={contactExpertiseData} margin={{ left: 8, right: 8, top: 8, bottom: 24 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : null}

        {topPaths.length > 0 ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">Pages les plus visitées</CardTitle>
              <CardDescription>Sur les 30 derniers jours.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ value: { label: "Visites", color: "hsl(var(--primary))" } }}
                className="aspect-[21/9] w-full"
              >
                <BarChart data={topPaths} margin={{ left: 8, right: 8, top: 8, bottom: 40 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : null}

        {topArticles.length > 0 ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">Top articles — engagement</CardTitle>
              <CardDescription>J’aime, partages et commentaires approuvés.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={engagementChartConfig} className="aspect-[21/9] w-full">
                <BarChart
                  data={topArticles.map((a) => ({
                    ...a,
                    short: a.title.length > 28 ? `${a.title.slice(0, 28)}…` : a.title,
                  }))}
                  margin={{ left: 8, right: 8, top: 8, bottom: 40 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="short" tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="likes" stackId="a" fill="var(--color-likes)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="shares" stackId="a" fill="var(--color-shares)" />
                  <Bar dataKey="comments" stackId="a" fill="var(--color-comments)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement des statistiques…</p>
      ) : null}
    </div>
  );
}
