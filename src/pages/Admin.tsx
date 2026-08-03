import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ContentAdmin } from "@/components/admin/ContentAdmin";
import { HomeAdmin } from "@/components/admin/HomeAdmin";
import { HeaderFooterAdmin } from "@/components/admin/HeaderFooterAdmin";
import { SeoAdmin } from "@/components/admin/SeoAdmin";
import { SeoSiteAdmin } from "@/components/admin/SeoSiteAdmin";
import { SeoAuditAdmin } from "@/components/admin/SeoAuditAdmin";
import { CabinetAdmin } from "@/components/admin/CabinetAdmin";
import { LogosAdmin } from "@/components/admin/LogosAdmin";
import { NewsAdmin } from "@/components/admin/NewsAdmin";
import { TeamAdmin } from "@/components/admin/TeamAdmin";
import { FounderProfileAdmin } from "@/components/admin/FounderProfileAdmin";
import { ContactAdmin } from "@/components/admin/ContactAdmin";
import { ContactMessagesAdmin } from "@/components/admin/ContactMessagesAdmin";
import { ExpertisesAdmin } from "@/components/admin/ExpertisesAdmin";
import { ExpertisesPageAdmin } from "@/components/admin/ExpertisesPageAdmin";
import { NewsPageAdmin } from "@/components/admin/NewsPageAdmin";
import { TeamPageAdmin } from "@/components/admin/TeamPageAdmin";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { ChatbotAdmin } from "@/components/admin/ChatbotAdmin";
import { EditorialAiAdmin } from "@/components/admin/EditorialAiAdmin";
import { LandingPagesAdmin } from "@/components/admin/LandingPagesAdmin";
import { BusinessCardAdmin } from "@/components/admin/BusinessCardAdmin";
import { ThemeAdmin } from "@/components/admin/ThemeAdmin";

import {
  LogOut,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Newspaper,
  Users as UsersIcon,
  Phone,
  Sparkles,
  Shield,
  ScrollText,
  Search,
  Home,
  Building,
  Inbox,
  Bot,
  Lock,
  QrCode,
  Palette,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const CHATBOT_PIN = "2485";
const CHATBOT_PIN_STORAGE = "rv_chatbot_admin_unlocked";

type TabKey =
  | "home"
  | "cabinet"
  | "header_footer"
  | "seo"
  | "seo_site"
  | "seo_audit"
  | "content"
  | "logos"
  | "expertises"
  | "expertises_page"
  | "news"
  | "news_page"
  | "team"
  | "team_founder"
  | "team_page"
  | "contact"
  | "contact_messages"
  | "chatbot"
  | "editorial_ai"
  | "landing_pages"
  | "business_card"
  | "users"
  | "theme";

const NAV: { key: TabKey; label: string; icon: typeof FileText; section: string; adminOnly?: boolean }[] = [
  { key: "home", label: "Page d'accueil", icon: Home, section: "/" },
  { key: "cabinet", label: "Page Cabinet", icon: Building, section: "/cabinet" },
  { key: "expertises", label: "Expertises (fiches)", icon: Sparkles, section: "/expertises" },
  { key: "expertises_page", label: "Page Expertises (textes)", icon: FileText, section: "/expertises" },
  { key: "team", label: "Équipe (membres)", icon: UsersIcon, section: "/equipe" },
  { key: "team_founder", label: "Fondateur — Profil détaillé", icon: Sparkles, section: "/equipe" },
  { key: "team_page", label: "Page Équipe (textes)", icon: FileText, section: "/equipe" },
  { key: "news", label: "Actualités / Articles", icon: Newspaper, section: "/actualites" },
  { key: "news_page", label: "Page Actualités (textes)", icon: FileText, section: "/actualites" },
  { key: "contact", label: "Contact", icon: Phone, section: "/#contact" },
  { key: "business_card", label: "Carte de visite (QR code)", icon: QrCode, section: "/carte" },
  { key: "contact_messages", label: "Demandes de contact", icon: Inbox, section: "/admin", adminOnly: true },
  { key: "chatbot", label: "Chatbot IA", icon: Bot, section: "/", adminOnly: true },
  { key: "editorial_ai", label: "Assistant Rédaction IA", icon: Sparkles, section: "/admin", adminOnly: true },
  { key: "header_footer", label: "Header & Footer", icon: ScrollText, section: "/" },
  { key: "seo", label: "SEO — Référencement", icon: Search, section: "/" },
  { key: "landing_pages", label: "SEO — Pages géo (Paris/Abidjan)", icon: Search, section: "/" },
  { key: "seo_site", label: "SEO — Suivi & moteurs", icon: Search, section: "/", adminOnly: true },
  { key: "seo_audit", label: "SEO — Audit interne", icon: Search, section: "/", adminOnly: true },
  { key: "logos", label: "Logos", icon: ImageIcon, section: "/" },
  { key: "content", label: "Textes globaux", icon: FileText, section: "/" },
  { key: "theme", label: "Thème & Couleurs", icon: Palette, section: "/" },
  { key: "users", label: "Utilisateurs", icon: Shield, section: "/admin", adminOnly: true },
];

const Admin = () => {
  const { session, isStaff, isAdmin, loading, signOut, user } = useAuth();
  const [tab, setTab] = useState<TabKey>("home");
  const [serverCheck, setServerCheck] = useState<"pending" | "allowed" | "denied">("pending");
  const [chatbotUnlocked, setChatbotUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(CHATBOT_PIN_STORAGE) === "1";
  });
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin — Manuela DIABATE";
  }, []);

  // Server-side guard: re-validate role against the database via RPC.
  // Even if client state is tampered with, the RPC enforces real DB role.
  useEffect(() => {
    let cancelled = false;
    if (!session?.user) {
      setServerCheck("pending");
      return;
    }
    (async () => {
      const [{ data: isAdminDb }, { data: isEditorDb }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "editor" }),
      ]);
      if (cancelled) return;
      setServerCheck(isAdminDb || isEditorDb ? "allowed" : "denied");
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  if (loading || (session && serverCheck === "pending"))
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Vérification des droits…</div>;
  if (!session) return <Navigate to="/auth" replace />;
  if (!isStaff || serverCheck === "denied")
    return <Navigate to="/403" replace />;

  const items = NAV.filter((n) => !n.adminOnly || isAdmin);
  const current = items.find((i) => i.key === tab) ?? items[0];

  const requestTab = (key: TabKey) => {
    if (key === "chatbot" && !chatbotUnlocked) {
      setPinInput("");
      setPinError(null);
      setPinDialogOpen(true);
      return;
    }
    setTab(key);
  };

  const submitPin = () => {
    if (pinInput.trim() === CHATBOT_PIN) {
      sessionStorage.setItem(CHATBOT_PIN_STORAGE, "1");
      setChatbotUnlocked(true);
      setPinDialogOpen(false);
      setPinInput("");
      setPinError(null);
      setTab("chatbot");
    } else {
      setPinError("Code incorrect");
    }
  };

  return (
    <SidebarProvider>
      <div className="admin-sidebar min-h-screen flex w-full bg-secondary/30">
        <Sidebar collapsible="icon" className="admin-sidebar border-r-0">
          <SidebarHeader className="border-b border-sidebar-border bg-sidebar">
            <Link to="/" className="flex flex-col px-2 py-1 group-data-[collapsible=icon]:hidden">
              <span className="font-serif text-lg text-sidebar-foreground">Manuela DIABATE</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-sidebar-foreground/70">Admin</span>
            </Link>
            <span className="hidden group-data-[collapsible=icon]:flex justify-center font-serif text-lg text-sidebar-foreground">R</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = tab === item.key;
                    const locked = item.key === "chatbot" && !chatbotUnlocked;
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={item.label}
                          onClick={() => requestTab(item.key)}
                          className={cn(active && "bg-sidebar-accent text-sidebar-accent-foreground")}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="flex items-center gap-2">
                            {item.label}
                            {locked && <Lock className="h-3 w-3 opacity-70" />}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Voir le site">
                  <Link to="/">
                    <ExternalLink className="h-4 w-4" />
                    <span>Voir le site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut} tooltip="Se déconnecter">
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-background px-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger />
              <h1 className="font-serif text-lg text-primary truncate">{current?.label}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(current?.section ?? "/", "_blank", "noopener,noreferrer")
                }
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Prévisualiser</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {tab === "home" && <HomeAdmin />}
            {tab === "header_footer" && <HeaderFooterAdmin />}
            {tab === "theme" && <ThemeAdmin />}
            {tab === "seo" && <SeoAdmin />}
            {tab === "seo_site" && isAdmin && <SeoSiteAdmin />}
            {tab === "seo_audit" && isAdmin && <SeoAuditAdmin />}
            {tab === "cabinet" && <CabinetAdmin />}
            {tab === "content" && <ContentAdmin />}
            {tab === "logos" && <LogosAdmin />}
            {tab === "expertises" && <ExpertisesAdmin />}
            {tab === "expertises_page" && <ExpertisesPageAdmin />}
            {tab === "news" && <NewsAdmin />}
            {tab === "news_page" && <NewsPageAdmin />}
            {tab === "team" && <TeamAdmin />}
            {tab === "team_founder" && <FounderProfileAdmin />}
            {tab === "team_page" && <TeamPageAdmin />}
            {tab === "contact" && <ContactAdmin />}
            {tab === "contact_messages" && isAdmin && <ContactMessagesAdmin />}
            {tab === "chatbot" && isAdmin && chatbotUnlocked && <ChatbotAdmin />}
            {tab === "editorial_ai" && isAdmin && <EditorialAiAdmin />}
            {tab === "landing_pages" && <LandingPagesAdmin />}
            {tab === "business_card" && <BusinessCardAdmin />}
            {tab === "users" && isAdmin && <UsersAdmin />}
          </main>
        </div>
      </div>

      <Dialog open={pinDialogOpen} onOpenChange={(o) => { setPinDialogOpen(o); if (!o) { setPinInput(""); setPinError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Accès protégé — Chatbot IA
            </DialogTitle>
            <DialogDescription>
              Saisissez le code d'accès pour ouvrir la configuration du Chatbot IA.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitPin();
            }}
            className="space-y-3"
          >
            <Input
              autoFocus
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(null); }}
              placeholder="Code"
              className="text-center tracking-[0.5em] font-mono text-lg"
              maxLength={12}
            />
            {pinError && <p className="text-xs text-destructive text-center">{pinError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPinDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="gold">Déverrouiller</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Admin;
