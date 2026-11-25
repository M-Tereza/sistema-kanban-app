import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';

function CadastroTarefa() {
  const { idParam } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const endpoint = '/tarefas';

  const idProjetoInicial =
    searchParams.get('idProjeto') ||
    (location.state && location.state.idProjeto
      ? String(location.state.idProjeto)
      : '');

  const [id, setId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataCriacao, setDataCriacao] = useState('');
  const [dataLimiteInput, setDataLimiteInput] = useState('');
  const [idProjeto, setIdProjeto] = useState(idProjetoInicial);
  const [idFase, setIdFase] = useState('');
  const [idPrioridade, setIdPrioridade] = useState('');

  const [dadosFases, setDadosFases] = useState([]);
  const [dadosPrioridades, setDadosPrioridades] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    api
      .get('/prioridades')
      .then((res) => setDadosPrioridades(res.data))
      .catch(() => setDadosPrioridades([]));
  }, []);

  useEffect(() => {
    if (!idProjeto) {
      setDadosFases([]);
      return;
    }
    api
      .get(`/fases/projeto/${idProjeto}`)
      .then((res) => setDadosFases(res.data))
      .catch(() => setDadosFases([]));
  }, [idProjeto]);

  useEffect(() => {
    async function buscar() {
      if (idParam == null) {
        setCarregado(true);
        return;
      }
      try {
        const response = await api.get(`${endpoint}/${idParam}`);
        const tarefa = response.data;
        setId(tarefa.id);
        setTitulo(tarefa.titulo || '');
        setDescricao(tarefa.descricao || '');
        setDataCriacao(tarefa.dataCriacao || '');
        setIdFase(tarefa.idFase != null ? String(tarefa.idFase) : '');
        setIdPrioridade(
          tarefa.idPrioridade != null ? String(tarefa.idPrioridade) : ''
        );
        if (tarefa.idProjeto != null) {
          setIdProjeto(String(tarefa.idProjeto));
        }
        if (tarefa.dataLimite) {
          const dt = new Date(tarefa.dataLimite);
          if (!Number.isNaN(dt.getTime())) {
            setDataLimiteInput(dt.toISOString().slice(0, 16));
          }
        }
      } catch (error) {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao carregar tarefa.'
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
      mensagemErro('O título da tarefa é obrigatório.');
      return;
    }

    if (!idFase) {
      mensagemErro('Selecione uma fase para a tarefa.');
      return;
    }

    const dataLimiteIso = dataLimiteInput
      ? new Date(dataLimiteInput).toISOString()
      : null;

    const payload = {
      id: id || undefined,
      titulo: titulo.trim(),
      descricao: descricao && descricao.trim() ? descricao.trim() : null,
      dataCriacao: idParam != null ? dataCriacao || undefined : undefined,
      dataLimite: dataLimiteIso,
      idProjeto: idProjeto ? Number(idProjeto) : null,
      idFase: Number(idFase),
      idPrioridade: idPrioridade ? Number(idPrioridade) : null,
    };

    try {
      let projetoDestino = idProjeto;
      if (idParam == null) {
        const res = await api.post(endpoint, payload);
        mensagemSucesso('Tarefa cadastrada com sucesso!');
        if (res.data && res.data.idProjeto) {
          projetoDestino = String(res.data.idProjeto);
        }
      } else {
        const res = await api.put(`${endpoint}/${idParam}`, payload);
        mensagemSucesso('Tarefa atualizada com sucesso!');
        if (res.data && res.data.idProjeto) {
          projetoDestino = String(res.data.idProjeto);
        }
      }

      if (projetoDestino) {
        navigate(`/perfil-projeto/${projetoDestino}`);
      } else {
        navigate('/listagem-projetos');
      }
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao salvar tarefa.'
      );
    }
  }

  function cancelar() {
    if (idProjeto) {
      navigate(`/perfil-projeto/${idProjeto}`);
    } else {
      navigate('/listagem-projetos');
    }
  }

  if (!carregado || !dadosPrioridades) return null;

  return (
    <Card
      title={idParam == null ? 'Nova Tarefa' : 'Editar Tarefa'}
    >
      <FormGroup label="Título *" htmlFor="inputTituloTarefa">
        <input
          type="text"
          id="inputTituloTarefa"
          maxLength={120}
          className="form-control"
          placeholder="Ex.: Implementar tela de login"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Fase *" htmlFor="selectFaseTarefa">
        <select
          id="selectFaseTarefa"
          className="form-select"
          value={idFase}
          onChange={(e) => setIdFase(e.target.value)}
        >
          <option value="">Selecione uma fase</option>
          {dadosFases.map((fase) => (
            <option key={fase.id} value={fase.id}>
              {fase.nome}
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Prioridade" htmlFor="selectPrioridadeTarefa">
        <select
          id="selectPrioridadeTarefa"
          className="form-select"
          value={idPrioridade}
          onChange={(e) => setIdPrioridade(e.target.value)}
        >
          <option value="">Sem prioridade</option>
          {dadosPrioridades.map((pr) => (
            <option key={pr.id} value={pr.id}>
              {pr.nome}
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Data Limite" htmlFor="inputDataLimiteTarefa">
        <input
          type="datetime-local"
          id="inputDataLimiteTarefa"
          className="form-control"
          value={dataLimiteInput}
          onChange={(e) => setDataLimiteInput(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Descrição" htmlFor="inputDescricaoTarefa">
        <textarea
          id="inputDescricaoTarefa"
          maxLength={500}
          rows={3}
          className="form-control"
          placeholder="Detalhes ou critérios de aceite da tarefa..."
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
          onClick={cancelar}
        >
          Cancelar
        </button>
      </Stack>
    </Card>
  );
}

export default CadastroTarefa;