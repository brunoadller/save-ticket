import { FormEvent, useState } from "react";
import { POLOS, STUDENT_STATUS } from "../../constants";
import { Ticket, TicketFormData } from "../../types";
import { Field, inputClass } from "../ui/Field";
import { dateOnly, todayStr } from "../../lib/dates";
import { maskCpf } from "../../lib/format";
import { useUsers } from "../../hooks/useUsers";
import { useAuth } from "../../context/AuthContext";
import { CourseSelect } from "./CourseSelect";

interface Props {
  ticketExistente?: Ticket | null;
  onSubmit: (data: TicketFormData) => Promise<void>;
  onCancel: () => void;
  onCourseRenamed: () => void;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid grid-cols-2 gap-4">
      <legend className="col-span-2 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</span>
        {hint && <span className="text-xs text-muted ml-2">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

/** Formulário de cadastro/edição — só campos e envio; o "casco" (modal) fica em TicketFormModal. */
export function TicketForm({ ticketExistente: t, onSubmit, onCancel, onCourseRenamed }: Props) {
  const users = useUsers();
  const { user } = useAuth();
  const [form, setForm] = useState<TicketFormData>({
    protocolo: t?.protocolo ?? "",
    polo: t?.polo ?? POLOS[2].value,
    dataCriacao: t ? dateOnly(t.dataCriacao) : todayStr(),
    dataPrazo: t ? dateOnly(t.dataPrazo) : "",
    nomeAluno: t?.nomeAluno ?? "",
    cpf: t?.cpf ?? "",
    ra: t?.ra ?? "",
    curso: t?.curso ?? "",
    situacaoAtual: t?.situacaoAtual ?? "",
    telefone: t?.telefone ?? "",
    // Novo chamado: o responsável começa como quem está criando (pode ser trocado)
    assignedToId: t ? t.assignedTo?.id ?? "" : user?.id ?? "",
    justificativa: t?.justificativa ?? "",
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function set<K extends keyof TicketFormData>(key: K, value: TicketFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (form.dataPrazo < form.dataCriacao) {
      setErro("A data de previsão não pode ser anterior à data de realização.");
      return;
    }
    setEnviando(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setErro(err.response?.data?.error || "Não foi possível salvar o chamado.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{erro}</p>}

      <Section title="Chamado">
        <Field label="Código do chamado (protocolo)">
          <input
            required
            value={form.protocolo}
            onChange={(e) => set("protocolo", e.target.value)}
            className={inputClass}
            placeholder="CS44172141"
          />
        </Field>
        <Field label="Polo">
          <select
            value={form.polo}
            onChange={(e) => set("polo", e.target.value as TicketFormData["polo"])}
            className={inputClass}
          >
            {POLOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Responsável" className="col-span-2">
          <select
            value={form.assignedToId}
            onChange={(e) => set("assignedToId", e.target.value)}
            className={inputClass}
          >
            <option value="">Sem responsável</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
            {/* mantém o valor selecionado visível se a pessoa não estiver (ainda) na lista */}
            {form.assignedToId && !users.some((u) => u.id === form.assignedToId) && (
              <option value={form.assignedToId}>
                {t?.assignedTo?.id === form.assignedToId ? t.assignedTo.name : user?.name ?? "Usuário"}
              </option>
            )}
          </select>
        </Field>
        <Field label="Data de realização">
          <input
            required
            type="date"
            value={form.dataCriacao}
            onChange={(e) => set("dataCriacao", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Data de previsão">
          <input
            required
            type="date"
            min={form.dataCriacao}
            value={form.dataPrazo}
            onChange={(e) => set("dataPrazo", e.target.value)}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Aluno">
        <Field label="Nome do aluno">
          <input
            required
            value={form.nomeAluno}
            onChange={(e) => set("nomeAluno", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Telefone" >
          <input
            type="tel"
            inputMode="tel"
            value={form.telefone}
            onChange={(e) => set("telefone", e.target.value)}
            className={inputClass}
            placeholder="(53) 90000-0000"
          />
        </Field>
        <Field label="CPF">
          <input
            required
            inputMode="numeric"
            value={form.cpf}
            onChange={(e) => set("cpf", maskCpf(e.target.value))}
            className={inputClass}
            placeholder="000.000.000-00"
          />
        </Field>
      </Section>

      <Section title="Detalhes" hint="opcional">
        <Field label="RA">
          <input value={form.ra} onChange={(e) => set("ra", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Situação atual">
          <select
            value={form.situacaoAtual}
            onChange={(e) => set("situacaoAtual", e.target.value as TicketFormData["situacaoAtual"])}
            className={inputClass}
          >
            <option value="">Não informada</option>
            {STUDENT_STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Curso" className="col-span-2">
          <CourseSelect value={form.curso} onChange={(v) => set("curso", v)} onRenamed={onCourseRenamed} />
        </Field>
        <Field label="Justificativa" className="col-span-2">
          <textarea
            rows={3}
            value={form.justificativa}
            onChange={(e) => set("justificativa", e.target.value)}
            className={inputClass}
          />
        </Field>
      </Section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded border border-line text-fg hover:bg-subtle"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="px-4 py-2 text-sm rounded bg-btn text-btn-fg hover:bg-btn-hover disabled:opacity-60"
        >
          {enviando ? "Salvando…" : "Salvar chamado"}
        </button>
      </div>
    </form>
  );
}
