export function formatarLocalDate(valor) {
  if (!valor) return '—';
  const partes = String(valor).split('T')[0].split('-');
  if (partes.length !== 3) return String(valor);
  const [ano, mes, dia] = partes;
  if (!ano || !mes || !dia) return String(valor);
  return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
}

export function formatarInstant(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function normalizarTexto(texto) {
  if (!texto) return '';
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}