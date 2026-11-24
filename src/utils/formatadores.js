export const formatarData = (data) => {
    if (!data) return null;
    return new Date(data).toLocaleDateString("pt-BR");
};

export const formatarDataHora = (dataHora) => {
    if (!dataHora) return null;

    const [data, hora] = dataHora.split("T");
    const [ano, mes, dia] = data.split("-");
    const [h, m] = hora.split(":");

    return `${dia}/${mes}/${ano} ${h}:${m}`;
};

export const normalizarStringValorMonetario = (stringValor) => {
    if (stringValor === undefined || stringValor === null || stringValor === "") return null;

    stringValor = String(stringValor).trim();

    if (stringValor.includes(".") && stringValor.includes(",")) {
        if (stringValor.lastIndexOf(".") > stringValor.lastIndexOf(",")) {
            stringValor = stringValor.replace(/,/g, "");
        } else {
            stringValor = stringValor.replace(/\./g, "").replace(",", ".");
        }
    } 
    else if (stringValor.includes(",")) {
        stringValor = stringValor.replace(",", ".");
    }
    const formatoDecimalEstrito = /^\d+\.\d+$/;

    if (!formatoDecimalEstrito.test(stringValor)) {
        return null;
    }

    return stringValor;
};

export const formatarCPF = (value) => {
  if (!value) return '';

  const cpf = value.replace(/\D/g, '');

  return cpf
    .padStart(11, '0')
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatarTelefone = (value) => {
  if (!value) return '';

  const tel = value.replace(/\D/g, '');

  if (tel.length === 10) {
    return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  if (tel.length === 11) {
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return value;
};

export const formatarCEP = (value) => {
  if (!value) return '';

  const cep = value.replace(/\D/g, '');

  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const toTitleCase = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// function gerarNomePadronizado(texto) {
//     return texto
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .toLowerCase()
//       .replace(/[^a-z0-9]/g, "")
//       .trim();
//   }