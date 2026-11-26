import { useEffect, useState } from "react";
import api from "../api/axios";
import { Course } from "../types";

const byName = (a: Course, b: Course) => a.name.localeCompare(b.name, "pt-BR");

/** Lista de cursos do select, com inclusão e correção de nomes. */
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .get<Course[]>("/courses")
      .then(({ data }) => setCourses([...data].sort(byName)))
      .catch(() => setLoadError(true));
  }, []);

  const addCourse = async (name: string) => {
    const { data } = await api.post<Course>("/courses", { name });
    setCourses((prev) => [...prev, data].sort(byName));
    return data;
  };

  const renameCourse = async (id: string, name: string) => {
    const { data } = await api.patch<Course>(`/courses/${id}`, { name });
    setCourses((prev) => prev.map((c) => (c.id === id ? data : c)).sort(byName));
    return data;
  };

  return { courses, loadError, addCourse, renameCourse };
}
