import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';

function CadastroAreaProjeto() {
  const { idParam } = useParams();
  const navigate = useNavigate();
  const endpoint = '/areas-projeto';

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function buscar() {
      if (idParam == null) {
        setCarregado(true);
        return;
      }
      try {
        const response = await api.get(`${endpoint}/${idParam}`);
        setId(response.data.id);
        setNome(response.data.nome || '');
      } catch (error) {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao carregar área de projeto.'
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
      mensagemErro('O nome da área de projeto é obrigatório.');
      return;
    }

    const payload = {
      id: id || undefined,
      nome: nome.trim(),
    };

    try {
      if (idParam == null) {
        await api.post(endpoint, payload);
        mensagemSucesso('Área de projeto cadastrada com sucesso!');
      } else {
        await api.put(`${endpoint}/${idParam}`, payload);
        mensagemSucesso('Área de projeto atualizada com sucesso!');
      }
      navigate('/listagem-areas-projeto');
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao salvar área de projeto.'
      );
    }
  }

  if (!carregado) return null;

  return (
    <Card
      title={
        idParam == null
          ? 'Cadastro de Área de Projeto'
          : 'Edição de Área de Projeto'
      }
    >
      <FormGroup label="Nome *" htmlFor="inputNome">
        <input
          type="text"
          id="inputNome"
          maxLength={100}
          className="form-control"
          placeholder="Ex.: Engenharia de Software"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
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
          onClick={() => navigate('/listagem-areas-projeto')}
        >
          Cancelar
        </button>
      </Stack>
    </Card>
  );
}

export default CadastroAreaProjeto;