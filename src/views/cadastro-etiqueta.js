import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';

function CadastroEtiqueta() {
  const { idParam } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const endpoint = '/etiquetas';

  const idProjetoInicial =
    searchParams.get('idProjeto') ||
    (location.state && location.state.idProjeto
      ? String(location.state.idProjeto)
      : '');

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#3B82F6');
  const [idProjeto, setIdProjeto] = useState(idProjetoInicial);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function buscar() {
      if (idParam == null) {
        setCarregado(true);
        return;
      }
      try {
        const response = await api.get(`${endpoint}/${idParam}`);
        const etiqueta = response.data;
        setId(etiqueta.id);
        setNome(etiqueta.nome || '');
        setCor(etiqueta.cor || '#3B82F6');
        setIdProjeto(
          etiqueta.idProjeto != null ? String(etiqueta.idProjeto) : ''
        );
      } catch (error) {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao carregar etiqueta.'
        );
      } finally {
        setCarregado(true);
      }
    }

    setCarregado(false);
    buscar();
  }, [idParam]);

  async function salvar() {
    if (!nome || !nome.trim()) {
      mensagemErro('O nome da etiqueta é obrigatório.');
      return;
    }

    const payload = {
      id: id || undefined,
      nome: nome.trim(),
      cor: cor && cor.trim() ? cor.trim() : null,
      idProjeto: idProjeto ? Number(idProjeto) : null,
    };

    try {
      let projetoDestino = idProjeto;
      if (idParam == null) {
        const res = await api.post(endpoint, payload);
        mensagemSucesso('Etiqueta cadastrada com sucesso!');
        if (res.data && res.data.idProjeto) {
          projetoDestino = String(res.data.idProjeto);
        }
      } else {
        const res = await api.put(`${endpoint}/${idParam}`, payload);
        mensagemSucesso('Etiqueta atualizada com sucesso!');
        if (res.data && res.data.idProjeto) {
          projetoDestino = String(res.data.idProjeto);
        }
      }

      if (projetoDestino) {
        navigate(`/perfil-projeto/${projetoDestino}`);
      } else {
        navigate('/listagem-etiquetas');
      }
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao salvar etiqueta.'
      );
    }
  }

  function cancelar() {
    if (idProjeto) {
      navigate(`/perfil-projeto/${idProjeto}`);
    } else {
      navigate('/listagem-etiquetas');
    }
  }

  if (!carregado) return null;

  const corHexValida = /^#([A-Fa-f0-9]{6})$/.test((cor || '').trim())
    ? cor.trim()
    : '#3B82F6';

  return (
    <Card title={idParam == null ? 'Nova Etiqueta' : 'Editar Etiqueta'}>
      <FormGroup label="Nome *" htmlFor="inputNomeEtiqueta">
        <input
          type="text"
          id="inputNomeEtiqueta"
          maxLength={80}
          className="form-control"
          placeholder="Ex.: Backend, Bug, Frontend..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Cor (hexadecimal)" htmlFor="inputCorEtiqueta">
        <div className="d-flex align-items-center gap-2">
          <input
            type="color"
            id="inputCorEtiqueta"
            className="form-control form-control-color"
            value={corHexValida}
            onChange={(e) => setCor(e.target.value.toUpperCase())}
            title="Escolha uma cor"
          />
          <input
            type="text"
            maxLength={7}
            className="form-control"
            placeholder="Ex.: #3B82F6 (padrão se vazio)"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
          />
        </div>
      </FormGroup>

      <br />
      <Stack spacing={1} padding={1} direction="row">
        <button type="button" className="btn btn-success" onClick={salvar}>
          Salvar
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={cancelar}
        >
          Cancelar
        </button>
      </Stack>
    </Card>
  );
}

export default CadastroEtiqueta;