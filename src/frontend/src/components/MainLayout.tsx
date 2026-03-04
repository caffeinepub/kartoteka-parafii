import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  Home,
  Mail,
  MapPin,
  Menu,
  Moon,
  Sun,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import BaptismsRegistry from "../pages/BaptismsRegistry";
import Budzet from "../pages/Budzet";
import Dashboard from "../pages/Dashboard";
import FunkcjeParafialne from "../pages/FunkcjeParafialne";
import Kartoteka from "../pages/Kartoteka";
import Korespondencja from "../pages/Korespondencja";
import Miejscowosci from "../pages/Miejscowosci";
import Statystyki from "../pages/Statystyki";
import Uwagi from "../pages/Uwagi";
import Wydarzenia from "../pages/Wydarzenia";

type Section =
  | "dashboard"
  | "kartoteka"
  | "miejscowosci"
  | "budzet"
  | "wydarzenia"
  | "funkcje"
  | "statystyki"
  | "uwagi"
  | "korespondencja"
  | "chrzty";

export default function MainLayout() {
  const [currentSection, setCurrentSection] = useState<Section>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const menuItems = [
    { id: "dashboard" as Section, label: "Dashboard", icon: Home },
    { id: "kartoteka" as Section, label: "Kartoteka", icon: Users },
    { id: "miejscowosci" as Section, label: "Miejscowości", icon: MapPin },
    { id: "budzet" as Section, label: "Budżet", icon: Wallet },
    { id: "wydarzenia" as Section, label: "Wydarzenia", icon: Calendar },
    { id: "funkcje" as Section, label: "Funkcje parafialne", icon: Briefcase },
    { id: "statystyki" as Section, label: "Statystyki", icon: BarChart3 },
    { id: "uwagi" as Section, label: "Uwagi", icon: FileText },
    { id: "korespondencja" as Section, label: "Korespondencja", icon: Mail },
    { id: "chrzty" as Section, label: "Chrzty", icon: BookOpen },
  ];

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "kartoteka":
        return <Kartoteka />;
      case "miejscowosci":
        return <Miejscowosci />;
      case "budzet":
        return <Budzet />;
      case "wydarzenia":
        return <Wydarzenia />;
      case "funkcje":
        return <FunkcjeParafialne />;
      case "statystyki":
        return <Statystyki />;
      case "uwagi":
        return <Uwagi />;
      case "korespondencja":
        return <Korespondencja />;
      case "chrzty":
        return <BaptismsRegistry />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/assets/generated/parish-logo.dim_300x300.png"
              alt="Logo Parafii"
              className="w-12 h-12 object-contain flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground leading-tight">
                Parafia Św. Jana Chrzciciela
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Zbrosza Duża
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      currentSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userProfile?.name || "Użytkownik"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userProfile?.role || "Pracownik"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Wyloguj
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/parish-logo.dim_300x300.png"
              alt="Logo Parafii"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-base font-bold text-foreground">
              Parafia Zbrosza Duża
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card">
            <nav className="p-4">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSection(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          currentSection === item.id
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="p-4 border-t border-border flex items-center gap-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Wyloguj
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-16">
        {renderSection()}
      </main>
    </div>
  );
}
