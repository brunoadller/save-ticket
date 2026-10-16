import { FormEvent, useState } from "react";
import { POLOS } from "../../constants";
import { Ticket, TicketFormData } from "../../types";
import { Field, inputClass } from "../ui/Field";
import { dateOnly, todayStr } from "../../lib/dates";
import { maskCpf } from "../../lib/format";

interface Props {
  ticketExistente?: Ticket | null;
  onSubmit: (data: TicketFormData) => Promise<void>;
  onCancel: () => void;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid grid-cols-2 gap-4">
      <legend className="col-span-2 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{title}</span>
        {hint && <span className="text-xs text-ink-700/50 ml-2">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

/** Formulário de cadastro/edição — só campos e envio; o "casco" (modal) fica em TicketFormModal. */
export function TicketForm({ ticketExistente: t, onSubmit, onCancel }: Props) {
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
          <input
            value={form.situacaoAtual}
            onChange={(e) => set("situacaoAtual", e.target.value)}
            className={inputClass}
            placeholder="FORMANDO"
          />
        </Field>
        <Field label="Curso" className="col-span-2">
          <input value={form.curso} onChange={(e) => set("curso", e.target.value)} className={inputClass} />
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
          className="px-4 py-2 text-sm rounded border border-ink-900/15 text-ink-800 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="px-4 py-2 text-sm rounded bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-60"
        >
          {enviando ? "Salvando…" : "Salvar chamado"}
        </button>
      </div>
    </form>
  );
}
