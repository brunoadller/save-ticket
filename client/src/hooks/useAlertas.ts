import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { Ticket, Task } from "../types";

/** Contadores para os selos da sidebar (chamados expirados e tarefas atrasadas). */
export function useAlertas() {
  const { pathname } = useLocation();
  const [alertas, setAlertas] = useState({ chamados: 0, tarefas: 0 });

  useEffect(() => {
    let ativo = true;
    Promise.all([api.get<Ticket[]>("/tickets"), api.get<Task[]>("/tasks", { params: { atrasadas: 1 } })])
      .then(([t, k]) => {
        if (!ativo) return;
        setAlertas({
          chamados: t.data.filter((x) => x.status === "EXPIRADO").length,
          tarefas: k.data.length,
        });
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [pathname]);

  return alertas;
}
