import { normalizarTexto } from './formatters';

export function ordenarFasesPorOrdem(fases = []) {
  return [...fases].sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0));
}

export function correspondeBusca(campos = [], termo = '') {
  const termoLimpo = normalizarTexto(termo);
  if (!termoLimpo) return true;
  return campos.some((campo) => normalizarTexto(campo).includes(termoLimpo));
}