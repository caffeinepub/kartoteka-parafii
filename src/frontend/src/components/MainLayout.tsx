import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  Home,
  LogOut,
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
      <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-sidebar-border bg-sidebar">
        {/* Logo & Parish Name */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/assets/generated/parish-logo.dim_300x300.png"
              alt="Logo Parafii"
              className="w-12 h-12 object-contain flex-shrink-0 drop-shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-sidebar-foreground leading-tight">
                Parafia Św. Jana Chrzciciela
              </h1>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(0.70 0.14 85)" }}
              >
                Zbrosza Duża
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon
                      className="h-4 w-4 flex-shrink-0"
                      style={
                        isActive
                          ? { color: "oklch(0.18 0.08 265)" }
                          : { opacity: 0.75 }
                      }
                    />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {userProfile?.name || "Użytkownik"}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "oklch(0.70 0.14 85 / 0.8)" }}
              >
                {userProfile?.role || "Pracownik"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-2"
            style={{
              background: "oklch(0.28 0.10 265)",
              color: "oklch(0.93 0.04 80)",
              border: "1px solid oklch(0.35 0.08 265)",
            }}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}
          </button>
          <Button
            onClick={handleLogout}
            size="sm"
            className="w-full gap-2 text-sm"
            style={{
              background: "oklch(0.28 0.10 265)",
              color: "oklch(0.93 0.04 80)",
              border: "1px solid oklch(0.35 0.08 265)",
            }}
          >
            <LogOut className="h-4 w-4" />
            Wyloguj
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/parish-logo.dim_300x300.png"
              alt="Logo Parafii"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-base font-bold text-sidebar-foreground">
              Parafia Zbrosza Duża
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
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
          <div className="border-t border-sidebar-border bg-sidebar">
            <nav className="p-4">
              <ul className="space-y-0.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSection(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-2"
                style={{
                  background: "oklch(0.28 0.10 265)",
                  color: "oklch(0.93 0.04 80)",
                  border: "1px solid oklch(0.35 0.08 265)",
                }}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}
              </button>
              <Button
                onClick={handleLogout}
                size="sm"
                className="w-full gap-2"
                style={{
                  background: "oklch(0.28 0.10 265)",
                  color: "oklch(0.93 0.04 80)",
                  border: "1px solid oklch(0.35 0.08 265)",
                }}
              >
                <LogOut className="h-4 w-4" />
                Wyloguj
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
