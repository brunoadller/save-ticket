import { KeyboardEvent, useState } from "react";
import { useCourses } from "../../hooks/useCourses";
import { inputClass } from "../ui/Field";
import { PencilIcon } from "../ui/icons";

interface Props {
  value: string;
  onChange: (name: string) => void;
  /** Chamado após corrigir um nome, pois os chamados com esse curso também mudam. */
  onRenamed: () => void;
}

type Mode = "add" | "rename";

/** Select de cursos com a "canetinha" para incluir um curso novo ou corrigir o selecionado. */
export function CourseSelect({ value, onChange, onRenamed }: Props) {
  const { courses, loadError, addCourse, renameCourse } = useCourses();
  const [mode, setMode] = useState<Mode | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = courses.find((c) => c.name === value);

  function open(next: Mode | null) {
    setMode(next);
    setName(next === "rename" ? value : "");
    setError(null);
  }

  async function save() {
    if (saving || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (mode === "rename" && selected) {
        const course = await renameCourse(selected.id, name);
        onChange(course.name);
        onRenamed();
      } else {
        const course = await addCourse(name);
        onChange(course.name);
      }
      open(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Não foi possível salvar o curso.");
    } finally {
      setSaving(false);
    }
  }

  // Está dentro do formulário do chamado: Enter salva o curso, não o chamado
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
  }

  const tab = (active: boolean) =>
    `rounded px-2 py-1 text-xs font-medium ${active ? "bg-accent/10 text-accent" : "text-muted hover:text-fg"}`;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          aria-label="Curso"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            open(null);
          }}
          className={`${inputClass} min-w-0 flex-1`}
        >
          <option value="">Não informado</option>
          {courses.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
          {/* mantém visível o curso digitado antes de existir a lista */}
          {value && !selected && <option value={value}>{value}</option>}
        </select>
        <button
          type="button"
          onClick={() => open(mode ? null : "add")}
          disabled={saving}
          title="Adicionar ou editar cursos"
          aria-label="Adicionar ou editar cursos"
          aria-expanded={!!mode}
          className="shrink-0 rounded border border-line-strong px-3 text-fg hover:bg-subtle"
        >
          <PencilIcon />
        </button>
      </div>

      {loadError && <p className="text-xs text-danger">Não foi possível carregar a lista de cursos.</p>}

      {mode && (
        <div className="space-y-2 rounded-lg border border-line bg-subtle p-3">
          <div className="flex gap-1">
            <button type="button" onClick={() => open("add")} className={tab(mode === "add")}>
              Adicionar novo
            </button>
            {selected && (
              <button type="button" onClick={() => open("rename")} className={tab(mode === "rename")}>
                Corrigir o selecionado
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              autoFocus
              aria-label="Nome do curso"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="NOME DO CURSO"
              className={`${inputClass} min-w-0 flex-1 uppercase`}
            />
            <button
              type="button"
              onClick={save}
              disabled={saving || !name.trim()}
              className="rounded bg-btn px-3 text-sm text-btn-fg hover:bg-btn-hover disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button type="button" onClick={() => open(null)} className="text-sm text-muted hover:text-fg">
              Cancelar
            </button>
          </div>
          {mode === "rename" && (
            <p className="text-xs text-muted">O novo nome também vale para os chamados que já usam este curso.</p>
          )}
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
