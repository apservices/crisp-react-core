import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Music, BarChart3, Wand2, User, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface Item {
  id: string;
  label: string;
  to: string;
  Icon: LucideIcon;
}

const items: Item[] = [
  { id: "home", label: "Início", to: "/dashboard", Icon: Home },
  { id: "vault", label: "Vault", to: "/vault", Icon: Music },
  { id: "explorer", label: "Explorer", to: "/explorer", Icon: BarChart3 },
  { id: "ai", label: "AI Studio", to: "/ai-studio", Icon: Wand2 },
  { id: "profile", label: "Perfil", to: "/profile", Icon: User },
];

export default function AppBottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/") return true;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-2 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-3xl mx-auto px-3 pointer-events-auto">
        <div className="glass border border-glass-border backdrop-blur-glass rounded-2xl shadow-lg pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between py-2 gap-1">
            {items.map(({ id, label, to, Icon }) => (
              <NavLink
                key={id}
                to={to}
                className={({ isActive: routeActive }) =>
                  [
                    "flex-1 min-w-0 flex flex-col items-center gap-1 p-1.5 rounded-lg transition-smooth",
                    routeActive || isActive(to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  ].join(" ")
                }
                end
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none truncate">{label}</span>
              </NavLink>
            ))}

            {/* More */}
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="flex flex-col items-center h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="text-[10px] leading-none">Mais</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-w-3xl mx-auto">
                <DrawerHeader>
                  <DrawerTitle>Navegação</DrawerTitle>
                </DrawerHeader>
                <div className="grid grid-cols-2 gap-2 p-4">
                  {[
                    { to: "/trends", label: "Trends" },
                    { to: "/analytics", label: "Analytics" },
                    { to: "/calendar", label: "Calendário" },
                    { to: "/feedback", label: "Feedback" },
                    { to: "/landing-generator", label: "Landing Generator" },
                    { to: "/metadata", label: "Metadata" },
                    { to: "/marketplace", label: "Marketplace" },
                    { to: "/pricing", label: "Pricing" },
                    { to: "/studio", label: "Studio" },
                    { to: "/tracks", label: "Tracks" },
                  ].map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 rounded-lg border border-border hover:bg-muted/60 transition-smooth text-sm"
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </div>
  );
}
