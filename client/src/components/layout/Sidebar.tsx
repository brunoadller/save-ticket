import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAlertas } from "../../hooks/useAlertas";

const IconTicket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 11l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
);
const IconTeam = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M17 11a3 3 0 100-6M18 14.5c2 .4 3.5 2 3.5 4.5" strokeLinecap="round" />
  </svg>
);

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto min-w-[1.25rem] text-center text-[11px] font-semibold rounded-full bg-danger text-white px-1.5 py-0.5">
      {n}
    </span>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const alertas = useAlertas();

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
      isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <aside className="w-full md:w-56 shrink-0 bg-ink-900 text-white flex md:flex-col md:min-h-screen md:sticky md:top-0 md:h-screen">
      <div className="px-5 py-5 hidden md:block">
        <p className="text-[11px] font-medium tracking-wide text-white/50">Polos Pelotas/RS</p>
        <h1 className="text-base font-semibold">Gestão de chamados</h1>
      </div>

      <nav className="flex md:flex-col gap-1 px-3 py-2 md:py-0 flex-1 overflow-x-auto">
        <NavLink to="/" end className={link}>
          <IconTicket />
          Chamados
          <Badge n={alertas.chamados} />
        </NavLink>
        <NavLink to="/calendario" className={link}>
          <IconCalendar />
          Calendário
          <Badge n={alertas.tarefas} />
        </NavLink>
        {user?.role === "ADMIN" && (
          <NavLink to="/equipe/novo" className={link}>
            <IconTeam />
            Equipe
          </NavLink>
        )}
      </nav>

      <div className="px-5 py-4 text-sm border-l md:border-l-0 md:border-t border-white/10 flex md:block items-center gap-3">
        <p className="text-white/80 truncate">{user?.name}</p>
        <button onClick={logout} className="text-white/50 hover:text-white text-xs md:mt-1">
          Sair
        </button>
      </div>
    </aside>
  );
}
