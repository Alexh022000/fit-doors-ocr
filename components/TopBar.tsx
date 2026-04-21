"use client";

type Tab = "traitement" | "ged" | "stats";

export default function TopBar({
  activeTab,
  onTabChange,
  onDeposer
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onDeposer: () => void;
}) {
  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    {
      id: "traitement",
      label: "Traitement",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: "ged",
      label: "GED",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 7l9-4 9 4-9 4-9-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M3 12l9 4 9-4M3 17l9 4 9-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: "stats",
      label: "Statistiques",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    }
  ];

  return (
    <header className="h-16 bg-fit-topbar text-white flex items-center px-6 gap-8 shrink-0 border-b border-black/40">
      {/* Logo + titre */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-fit-red flex items-center justify-center shadow-lg shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="16" height="14" rx="1" stroke="white" strokeWidth="2" />
            <path d="M4 12h16" stroke="white" strokeWidth="2" />
            <path d="M8 9V5M16 9V5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="leading-tight min-w-0">
          <div className="font-bold text-base">
            FIT Doors<sup className="text-fit-red text-[10px] ml-0.5">®</sup>{" "}
            <span className="font-normal text-white/80">Extraction IA</span>
          </div>
          <div className="text-xs text-white/50 truncate">
            Bons de Commande & Devis
          </div>
        </div>
      </div>

      {/* Tabs centrales */}
      <nav className="flex items-center gap-1 bg-fit-topbar-soft rounded-lg p-1">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-2 px-4 h-9 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-fit-red text-white shadow"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Droite : status + CTA */}
      <div className="ml-auto flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-white/80">Mistral connecté · IA souveraine 🇫🇷</span>
        </div>

        <button
          onClick={onDeposer}
          className="inline-flex items-center gap-2 bg-fit-red hover:bg-fit-red-dark text-white font-medium px-4 h-10 rounded-lg shadow transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Déposer un BDC
        </button>
      </div>
    </header>
  );
}
