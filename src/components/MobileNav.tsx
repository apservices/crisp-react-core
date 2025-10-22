import { Music, TrendingUp, Lightbulb, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Início", icon: Home },
  { id: "vault", label: "Vault", icon: Music },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "inspiration", label: "Ideias", icon: Lightbulb },
  { id: "profile", label: "Perfil", icon: User },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-glass-border backdrop-blur-glass">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl transition-smooth min-w-0 relative",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
                <Icon className={cn(
                  "h-5 w-5",
                  isActive && "animate-scale-in"
                )} />
                <span className="text-xs font-medium leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}