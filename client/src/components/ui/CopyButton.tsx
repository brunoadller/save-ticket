import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

const COPIED_MS = 2 * 60 * 1000; // tempo em que o ícone fica verde

// Fora do componente: a marcação continua ao fechar e reabrir o chamado
const copiedUntil = new Map<string, number>();

interface Props {
  id: string; // identifica o campo, ex.: "<id do chamado>:cpf"
  value: string;
  label: string;
}

export function CopyButton({ id, value, label }: Props) {
  const key = `${id}:${value}`; // se o dado mudar, o verde some
  const [, setVersion] = useState(0);
  const [failed, setFailed] = useState(false);
  const refresh = () => setVersion((n) => n + 1);
  const until = copiedUntil.get(key) ?? 0;
  const copied = until > Date.now();

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(refresh, until - Date.now());
    return () => clearTimeout(timer);
  }, [copied, until]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      copiedUntil.set(key, Date.now() + COPIED_MS);
      setFailed(false);
    } catch {
      setFailed(true);
    }
    refresh();
  }

  const title = failed ? "Não foi possível copiar" : copied ? `${label}: copiado` : `Copiar ${label}`;

  return (
    <button
      type="button"
      onClick={copy}
      title={title}
      aria-label={title}
      className={`shrink-0 rounded p-1 transition-colors ${
        failed ? "text-danger" : copied ? "bg-ok/15 text-ok" : "text-muted hover:bg-fg/10 hover:text-fg"
      }`}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
