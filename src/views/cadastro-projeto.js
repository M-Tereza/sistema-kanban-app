import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';

function CadastroProjeto() {
  const { idParam } = useParams();
  const navigate = useNavigate();
  const endpoint = '/projetos';

  const [id, setId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idAreaProjeto, setIdAreaProjeto] = useState('');
  const [dadosAreasProjeto, setDadosAreasProjeto] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    api
      .get('/areas-projeto')
      .then((response) => setDadosAreasProjeto(response.data))
      .catch(() => setDadosAreasProjeto([]));
  }, []);

  useEffect(() => {
    async function buscar() {
      if (idParam == null) {
        setCarregado(true);
        return;
      }
      try {
        const response = await api.get(`${endpoint}/${idParam}`);
        setId(response.data.id);
        setTitulo(response.data.titulo || '');
        setDescricao(response.data.descricao || '');
        setIdAreaProjeto(
          response.data.idAreaProjeto != null
            ? String(response.data.idAreaProjeto)
            : ''
        );
      } catch (error) {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao carregar projeto.'
        );
      } finally {
        setCarregado(true);
      }
    }

    setCarregado(false);
    buscar();
  }, [idParam]);

  async function salvar() {
    if (!titulo || !titulo.trim()) {
      mensagemErro('O título do projeto é obrigatório.');
      return;
    }

    const payload = {
      id: id || undefined,
      titulo: titulo.trim(),
      descricao: descricao && descricao.trim() ? descricao.trim() : null,
      idAreaProjeto: idAreaProjeto ? Number(idAreaProjeto) : null,
    };

    try {
      if (idParam == null) {
        await api.post(endpoint, payload);
        mensagemSucesso('Projeto cadastrado com sucesso!');
      } else {
        await api.put(`${endpoint}/${idParam}`, payload);
        mensagemSucesso('Projeto atualizado com sucesso!');
      }
      navigate('/listagem-projetos');
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao salvar projeto.'
      );
    }
  }

  if (!carregado || !dadosAreasProjeto) return null;

  return (
    <Card
      title={idParam == null ? 'Cadastro de Projeto' : 'Edição de Projeto'}
    >
      <FormGroup label="Título *" htmlFor="inputTitulo">
        <input
          type="text"
          id="inputTitulo"
          maxLength={120}
          className="form-control"
          placeholder="Ex.: Portal Acadêmico"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Área de Projeto" htmlFor="selectAreaProjeto">
        <select
          id="selectAreaProjeto"
          className="form-select"
          value={idAreaProjeto}
          onChange={(e) => setIdAreaProjeto(e.target.value)}
        >
          <option value="">Sem área de projeto</option>
          {dadosAreasProjeto.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nome}
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Descrição" htmlFor="inputDescricao">
        <textarea
          id="inputDescricao"
          maxLength={500}
          rows={3}
          className="form-control"
          placeholder="Descreva brevemente o objetivo do projeto..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </FormGroup>

      <br />
      <Stack spacing={1} padding={1} direction="row">
        <button type="button" className="btn btn-success" onClick={salvar}>
          Salvar
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/listagem-projetos')}
        >
          Cancelar
        </button>
      </Stack>
    </Card>
  );
}

export default CadastroProjeto;