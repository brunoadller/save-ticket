import { useEffect, useRef, useState } from "react";

export const EXPAND_MS = 300; // precisa bater com a classe "duration-300" da animação

const TOP_OFFSET = 64; // cabeçalho fixo da lista (usar também como scroll-margin-top: "scroll-mt-16")
const BOTTOM_OFFSET = 96; // espaço da barra de ações em lote, quando ela está na tela

/** Rola só se o item não estiver inteiro visível; quando rola, ele vai para logo abaixo do cabeçalho. */
function revealElement(el: HTMLElement) {
  const { top, bottom } = el.getBoundingClientRect();
  const hasBottomBar = !!document.querySelector("[data-bottom-bar]");
  const limit = window.innerHeight - (hasBottomBar ? BOTTOM_OFFSET : 0);
  if (top >= TOP_OFFSET && bottom <= limit) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
}

/** Abre e fecha um conteúdo com animação, trazendo o item para a vista ao abrir. */
export function useExpandable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // o conteúdo continua montado enquanto fecha
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!open) {
      setExpanded(false);
      const unmount = setTimeout(() => setMounted(false), EXPAND_MS);
      return () => clearTimeout(unmount);
    }

    setMounted(true);
    // Dois quadros: o navegador precisa desenhar o conteúdo fechado antes de animar
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setExpanded(true));
    });
    // Só rola depois de abrir, quando a página já tem a altura final (vale para o fim da lista)
    const scroll = setTimeout(() => ref.current && revealElement(ref.current), EXPAND_MS + 50);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(scroll);
    };
  }, [open]);

  const toggle = () => setOpen((v) => !v);

  return { ref, open, mounted, expanded, toggle };
}
