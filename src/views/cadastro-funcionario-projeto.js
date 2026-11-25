import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';

function CadastroFuncionarioProjeto() {
  const { idParam } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const endpoint = '/funcionarios-projeto';

  const idProjetoInicial =
    searchParams.get('idProjeto') ||
    (location.state && location.state.idProjeto
      ? String(location.state.idProjeto)
      : '');

  const [id, setId] = useState('');
  const [idProjeto, setIdProjeto] = useState(idProjetoInicial);
  const [idFuncionario, setIdFuncionario] = useState('');
  const [ehResponsavel, setEhResponsavel] = useState(false);

  const [dadosProjetos, setDadosProjetos] = useState(null);
  const [dadosFuncionarios, setDadosFuncionarios] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    api
      .get('/projetos')
      .then((res) => setDadosProjetos(res.data))
      .catch(() => setDadosProjetos([]));

    api
      .get('/funcionarios')
      .then((res) => setDadosFuncionarios(res.data))
      .catch(() => setDadosFuncionarios([]));
  }, []);

  useEffect(() => {
    async function buscar() {
      if (idParam == null) {
        setCarregado(true);
        return;
      }
      try {
        const response = await api.get(`${endpoint}/${idParam}`);
        const vinculo = response.data;
        setId(vinculo.id);
        setIdProjeto(
          vinculo.idProjeto != null ? String(vinculo.idProjeto) : ''
        );
        setIdFuncionario(
          vinculo.idFuncionario != null ? String(vinculo.idFuncionario) : ''
        );
        setEhResponsavel(Boolean(vinculo.ehResponsavel));
      } catch (error) {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao carregar vínculo.'
        );
      } finally {
        setCarregado(true);
      }
    }

    setCarregado(false);
    buscar();
  }, [idParam]);

  async function salvar() {
    if (!idProjeto) {
      mensagemErro('Selecione um projeto.');
      return;
    }

    if (!idFuncionario) {
      mensagemErro('Selecione um funcionário.');
      return;
    }

    const payload = {
      id: id || undefined,
      idProjeto: Number(idProjeto),
      idFuncionario: Number(idFuncionario),
      ehResponsavel,
    };

    try {
      let projetoDestino = idProjeto;
      if (idParam == null) {
        const res = await api.post(endpoint, payload);
        mensagemSucesso('Participação vinculada com sucesso!');
        if (res.data && res.data.idProjeto) {
          projetoDestino = String(res.data.idProjeto);
        }
      } else {
        const res = await api.put(`${endpoint}/${idParam}`, payload);
        mensagemSucesso('Participação atualizada com sucesso!');
        if (res.data && res.data.idProjeto) {
          projetoDestino = String(res.data.idProjeto);
        }
      }

      if (idProjetoInicial && projetoDestino) {
        navigate(`/perfil-projeto/${projetoDestino}`);
      } else if (projetoDestino) {
        navigate(`/listagem-funcionarios-projeto?idProjeto=${projetoDestino}`);
      } else {
        navigate('/listagem-funcionarios-projeto');
      }
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao salvar participação.'
      );
    }
  }

  function cancelar() {
    if (idProjetoInicial) {
      navigate(`/perfil-projeto/${idProjetoInicial}`);
    } else if (idProjeto) {
      navigate(`/listagem-funcionarios-projeto?idProjeto=${idProjeto}`);
    } else {
      navigate('/listagem-funcionarios-projeto');
    }
  }

  if (!carregado || !dadosProjetos || !dadosFuncionarios) return null;

  const ocultarCampoProjeto = Boolean(idProjetoInicial);

  return (
    <Card
      title={
        idParam == null
          ? 'Vincular Funcionário ao Projeto'
          : 'Editar Participação no Projeto'
      }
    >
      {!ocultarCampoProjeto && (
        <FormGroup label="Projeto *" htmlFor="selectProjeto">
          <select
            id="selectProjeto"
            className="form-select"
            value={idProjeto}
            onChange={(e) => setIdProjeto(e.target.value)}
          >
            <option value="">Selecione um projeto</option>
            {dadosProjetos.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.titulo}
              </option>
            ))}
          </select>
        </FormGroup>
      )}

      <FormGroup label="Funcionário *" htmlFor="selectFuncionario">
        <select
          id="selectFuncionario"
          className="form-select"
          value={idFuncionario}
          onChange={(e) => setIdFuncionario(e.target.value)}
        >
          <option value="">Selecione um funcionário</option>
          {dadosFuncionarios.map((func) => (
            <option key={func.id} value={func.id}>
              {func.nome}
            </option>
          ))}
        </select>
      </FormGroup>

      <div className="form-check mt-2 mb-2">
        <input
          type="checkbox"
          id="checkEhResponsavel"
          className="form-check-input"
          checked={ehResponsavel}
          onChange={(e) => setEhResponsavel(e.target.checked)}
        />
        <label htmlFor="checkEhResponsavel" className="form-check-label">
          Responsável pelo projeto
        </label>
      </div>

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

export default CadastroFuncionarioProjeto;