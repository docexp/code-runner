import { useState, useEffect } from 'react';
import type { Highlighter } from 'shiki';

const SHIKI_LANGS = ['javascript', 'python', 'go', 'rust', 'java'] as const;

const LANG_MAP: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  go: 'go',
  rust: 'rust',
  java: 'java',
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['vesper'],
        langs: [...SHIKI_LANGS],
      })
    );
  }
  return highlighterPromise;
}

export function useShikiHighlight(code: string, lang: string): string | null {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setHtml(null);
      return;
    }
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return;
      const resolvedLang = LANG_MAP[lang] ?? 'text';
      setHtml(
        hl.codeToHtml(code, { lang: resolvedLang, theme: 'vesper' })
      );
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return html;
}
