import { useEffect, useState } from "react";
import api from "../api/axios";
import { Person } from "../types";

/** Equipe (apenas id e nome) para os seletores de criador/responsável. */
export function useUsers() {
  const [users, setUsers] = useState<Person[]>([]);

  useEffect(() => {
    api
      .get<Person[]>("/users")
      .then(({ data }) => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  return users;
}
