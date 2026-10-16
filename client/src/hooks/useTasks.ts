import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { Task, TaskFormData } from "../types";

/** Tarefas do calendário de um ano (a visão por mês é filtrada em memória). */
export function useTasks(ano: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const { data } = await api.get<Task[]>("/tasks", { params: { ano } });
      setTasks(data);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar as tarefas.");
    } finally {
      setCarregando(false);
    }
  }, [ano]);

  useEffect(() => {
    setCarregando(true);
    carregar();
  }, [carregar]);

  const criar = async (data: TaskFormData) => {
    await api.post("/tasks", data);
    await carregar();
  };
  const editar = async (id: string, data: Partial<TaskFormData>) => {
    await api.patch(`/tasks/${id}`, data);
    await carregar();
  };
  const alternar = async (t: Task) => {
    await api.patch(`/tasks/${t.id}`, { concluida: !t.concluida });
    await carregar();
  };
  const excluir = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    await carregar();
  };

  return { tasks, carregando, erro, criar, editar, alternar, excluir };
}
