import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';
import { useDebounce } from '../utils/useDebounce';
import { ordenarFasesPorOrdem, correspondeBusca } from '../utils/kanban';

function PerfilProjeto() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState(null);
  const [fases, setFases] = useState(null);
  const [tarefas, setTarefas] = useState(null);
  const [etiquetas, setEtiquetas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [tarefasEtiquetas, setTarefasEtiquetas] = useState([]);
  const [responsaveisTarefas, setResponsaveisTarefas] = useState([]);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarNovaFase, setMostrarNovaFase] = useState(false);

  const [busca, setBusca] = useState('');
  const buscaDebounced = useDebounce(busca, 250);
  const [filtroEtiqueta, setFiltroEtiqueta] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');

  const [nomeNovaFase, setNomeNovaFase] = useState('');
  const [ehFaseFinalNovaFase, setEhFaseFinalNovaFase] = useState(false);

  const [faseEditando, setFaseEditando] = useState(null);
  const [nomeFaseEditando, setNomeFaseEditando] = useState('');
  const [ehFaseFinalEditando, setEhFaseFinalEditando] = useState(false);

  const [fasePendenteExclusaoSimples, setFasePendenteExclusaoSimples] =
    useState(null);
  const [fasePendenteExclusao, setFasePendenteExclusao] = useState(null);
  const [tarefaPendenteExclusao, setTarefaPendenteExclusao] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      const [
        resProjeto,
        resFases,
        resTarefas,
        resEtiquetas,
        resPrioridades,
        resParticipantes,
      ] = await Promise.all([
        api.get(`/projetos/${idParam}`),
        api.get(`/fases/projeto/${idParam}`),
        api.get(`/tarefas/projeto/${idParam}`),
        api.get(`/etiquetas/projeto/${idParam}`),
        api.get('/prioridades'),
        api.get(`/funcionarios-projeto/projeto/${idParam}`),
      ]);

      setProjeto(resProjeto.data);
      setFases(ordenarFasesPorOrdem(resFases.data));
      setTarefas(resTarefas.data);
      setEtiquetas(resEtiquetas.data);
      setPrioridades(resPrioridades.data);
      setParticipantes(resParticipantes.data);

      const vinculosEtiquetasListas = await Promise.all(
        resTarefas.data.map((t) =>
          api
            .get(`/tarefas-etiquetas/tarefa/${t.id}`)
            .then((r) => r.data)
            .catch(() => [])
        )
      );
      setTarefasEtiquetas(vinculosEtiquetasListas.flat());

      const responsaveisListas = await Promise.all(
        resTarefas.data.map((t) =>
          api
            .get(`/responsaveis-tarefa/tarefa/${t.id}`)
            .then((r) => r.data)
            .catch(() => [])
        )
      );
      setResponsaveisTarefas(responsaveisListas.flat());
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao carregar o quadro Kanban do projeto.'
      );
      setProjeto(false);
      setFases([]);
      setTarefas([]);
    }
  }, [idParam]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function criarFase(e) {
    e.preventDefault();
    if (!nomeNovaFase || !nomeNovaFase.trim()) {
      mensagemErro('Informe o nome da fase.');
      return;
    }

    const proximaOrdem = (fases ? fases.length : 0) + 1;
    try {
      await api.post('/fases', {
        nome: nomeNovaFase.trim(),
        ordem: proximaOrdem,
        ehFaseFinal: ehFaseFinalNovaFase,
        idProjeto: Number(idParam),
      });
      mensagemSucesso('Fase criada com sucesso!');
      setNomeNovaFase('');
      setEhFaseFinalNovaFase(false);
      setMostrarNovaFase(false);
      carregarDados();
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao criar fase.'
      );
    }
  }

  function abrirEdicaoFase(fase) {
    setFaseEditando(fase);
    setNomeFaseEditando(fase.nome || '');
    setEhFaseFinalEditando(Boolean(fase.ehFaseFinal));
  }

  function fecharEdicaoFase() {
    setFaseEditando(null);
    setNomeFaseEditando('');
    setEhFaseFinalEditando(false);
  }

  async function salvarEdicaoFase(e) {
    e.preventDefault();
    if (!faseEditando) return;
    if (!nomeFaseEditando || !nomeFaseEditando.trim()) {
      mensagemErro('Informe o nome da fase.');
      return;
    }

    try {
      await api.put(`/fases/${faseEditando.id}`, {
        id: faseEditando.id,
        nome: nomeFaseEditando.trim(),
        ordem: faseEditando.ordem,
        ehFaseFinal: ehFaseFinalEditando,
        idProjeto: faseEditando.idProjeto || Number(idParam),
      });
      mensagemSucesso('Fase atualizada com sucesso!');
      fecharEdicaoFase();
      carregarDados();
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao atualizar fase.'
      );
    }
  }

  async function moverFase(faseId, direcao) {
    const endpoint =
      direcao === 'esquerda'
        ? `/fases/${faseId}/mover-esquerda`
        : `/fases/${faseId}/mover-direita`;
    try {
      await api.put(endpoint);
      carregarDados();
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao reordenar fase.'
      );
    }
  }

  function solicitarExclusaoFase(fase) {
    const temTarefasNaFase = tarefas.some(
      (t) => Number(t.idFase) === Number(fase.id)
    );
    if (temTarefasNaFase) {
      setFasePendenteExclusao(fase);
    } else {
      setFasePendenteExclusaoSimples(fase);
    }
  }

  async function confirmarExclusaoFaseSimples() {
    if (!fasePendenteExclusaoSimples) return;
    const faseId = fasePendenteExclusaoSimples.id;
    try {
      await api.delete(`/fases/${faseId}`);
      mensagemSucesso('Fase excluída com sucesso!');
      setFases(fases.filter((f) => f.id !== faseId));
      setFasePendenteExclusaoSimples(null);
    } catch (error) {
      const msg =
        error.response && error.response.data ? String(error.response.data) : '';
      setFasePendenteExclusaoSimples(null);
      if (
        msg.toLowerCase().includes('tarefas') ||
        msg.toLowerCase().includes('aviso prévio')
      ) {
        const faseAlvo = fases.find((f) => Number(f.id) === Number(faseId));
        if (faseAlvo) setFasePendenteExclusao(faseAlvo);
      } else {
        mensagemErro(msg || 'Erro ao excluir fase.');
      }
    }
  }

  async function confirmarExclusaoFaseComTarefas() {
    if (!fasePendenteExclusao) return;
    const faseId = fasePendenteExclusao.id;
    try {
      await api.delete(`/fases/${faseId}?confirmarExclusaoTarefas=true`);
      mensagemSucesso('Fase e tarefas vinculadas excluídas com sucesso!');
      setFasePendenteExclusao(null);
      carregarDados();
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao confirmar exclusão da fase.'
      );
    }
  }

  async function confirmarExclusaoTarefa() {
    if (!tarefaPendenteExclusao) return;
    const tarefaId = tarefaPendenteExclusao.id;
    try {
      await api.delete(`/tarefas/${tarefaId}`);
      mensagemSucesso('Tarefa excluída com sucesso!');
      setTarefas((prev) => prev.filter((t) => Number(t.id) !== Number(tarefaId)));
      setTarefaPendenteExclusao(null);
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao excluir tarefa.'
      );
      setTarefaPendenteExclusao(null);
    }
  }

  async function moverTarefaParaFase(tarefa, novaFaseId) {
    if (!novaFaseId || Number(tarefa.idFase) === Number(novaFaseId)) return;
    try {
      await api.put(`/tarefas/${tarefa.id}`, {
        id: tarefa.id,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || null,
        dataCriacao: tarefa.dataCriacao,
        dataLimite: tarefa.dataLimite || null,
        idProjeto: tarefa.idProjeto || Number(idParam),
        idFase: Number(novaFaseId),
        idPrioridade: tarefa.idPrioridade || null,
      });
      mensagemSucesso('Tarefa movida com sucesso!');
      carregarDados();
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao mover tarefa.'
      );
    }
  }

  function limparFiltros() {
    setBusca('');
    setFiltroEtiqueta('');
    setFiltroPrioridade('');
    setFiltroResponsavel('');
  }

  if (!fases || !tarefas) return null;

  const quantidadeFiltrosAtivos = [
    busca.trim(),
    filtroEtiqueta,
    filtroPrioridade,
    filtroResponsavel,
  ].filter(Boolean).length;

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const bateBusca = correspondeBusca(
      [tarefa.titulo, tarefa.descricao],
      buscaDebounced
    );

    const batePrioridade =
      !filtroPrioridade ||
      String(tarefa.idPrioridade || '') === String(filtroPrioridade);

    const bateEtiqueta =
      !filtroEtiqueta ||
      tarefasEtiquetas.some(
        (te) =>
          Number(te.idTarefa) === Number(tarefa.id) &&
          String(te.idEtiqueta) === String(filtroEtiqueta)
      );

    const bateResponsavel =
      !filtroResponsavel ||
      responsaveisTarefas.some(
        (rt) =>
          Number(rt.idTarefa) === Number(tarefa.id) &&
          String(rt.idFuncionarioProjeto) === String(filtroResponsavel)
      );

    return bateBusca && batePrioridade && bateEtiqueta && bateResponsavel;
  });

  const tituloCard = projeto
    ? `Quadro Kanban — ${projeto.titulo}`
    : `Quadro Kanban — Projeto #${idParam}`;

  return (
    <Card title={tituloCard}>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div className="text-muted">
          {projeto && projeto.descricao
            ? projeto.descricao
            : 'Gerencie fases, tarefas, etiquetas e responsáveis do projeto.'}
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/listagem-projetos')}
        >
          ← Voltar aos Projetos
        </button>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 mb-3 border-bottom">
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/cadastro-tarefa?idProjeto=${idParam}`)}
          >
            + Nova Tarefa
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => navigate(`/cadastro-etiqueta?idProjeto=${idParam}`)}
          >
            + Nova Etiqueta
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() =>
              navigate(`/listagem-etiquetas?idProjeto=${idParam}`)
            }
          >
            Etiquetas
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() =>
              navigate(`/listagem-funcionarios-projeto?idProjeto=${idParam}`)
            }
          >
            Participantes
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn ${
              mostrarFiltros || quantidadeFiltrosAtivos > 0
                ? 'btn-info text-white'
                : 'btn-outline-secondary'
            }`}
            onClick={() => setMostrarFiltros((prev) => !prev)}
          >
            Filtros
            {quantidadeFiltrosAtivos > 0 && (
              <span className="badge bg-light text-dark ms-2">
                {quantidadeFiltrosAtivos}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`btn ${
              mostrarNovaFase ? 'btn-success' : 'btn-outline-success'
            }`}
            onClick={() => setMostrarNovaFase((prev) => !prev)}
          >
            + Nova Fase
          </button>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="card bg-light border-0 shadow-sm mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="small text-uppercase text-muted">
                Filtrar tarefas do quadro
              </strong>
              {quantidadeFiltrosAtivos > 0 && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0"
                  onClick={limparFiltros}
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label htmlFor="inputBuscaKanban" className="form-label small fw-semibold">
                  Buscar tarefa
                </label>
                <input
                  type="text"
                  id="inputBuscaKanban"
                  className="form-control form-control-sm"
                  placeholder="Título ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="filtroEtiqueta" className="form-label small fw-semibold">
                  Etiqueta
                </label>
                <select
                  id="filtroEtiqueta"
                  className="form-select form-select-sm"
                  value={filtroEtiqueta}
                  onChange={(e) => setFiltroEtiqueta(e.target.value)}
                >
                  <option value="">Todas</option>
                  {etiquetas.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="filtroPrioridade" className="form-label small fw-semibold">
                  Prioridade
                </label>
                <select
                  id="filtroPrioridade"
                  className="form-select form-select-sm"
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(e.target.value)}
                >
                  <option value="">Todas</option>
                  {prioridades.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="filtroResponsavel" className="form-label small fw-semibold">
                  Responsável
                </label>
                <select
                  id="filtroResponsavel"
                  className="form-select form-select-sm"
                  value={filtroResponsavel}
                  onChange={(e) => setFiltroResponsavel(e.target.value)}
                >
                  <option value="">Todos</option>
                  {participantes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomeFuncionario}
                      {p.ehResponsavel ? ' (Responsável)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarNovaFase && (
        <form
          onSubmit={criarFase}
          className="card bg-light border-0 shadow-sm mb-3"
        >
          <div className="card-body">
            <strong className="small text-uppercase text-muted d-block mb-2">
              Adicionar nova fase ao projeto
            </strong>
            <div className="row g-2 align-items-end">
              <div className="col-md-5">
                <label htmlFor="inputNovaFase" className="form-label small fw-semibold">
                  Nome da fase *
                </label>
                <input
                  type="text"
                  id="inputNovaFase"
                  maxLength={60}
                  className="form-control form-control-sm"
                  placeholder="Ex.: Em Revisão"
                  value={nomeNovaFase}
                  onChange={(e) => setNomeNovaFase(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <div className="form-check mb-1">
                  <input
                    type="checkbox"
                    id="checkFaseFinal"
                    className="form-check-input"
                    checked={ehFaseFinalNovaFase}
                    onChange={(e) => setEhFaseFinalNovaFase(e.target.checked)}
                  />
                  <label htmlFor="checkFaseFinal" className="form-check-label small">
                    Fase final (conclui tarefas)
                  </label>
                </div>
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-success btn-sm flex-grow-1">
                  Salvar Fase
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setMostrarNovaFase(false);
                    setNomeNovaFase('');
                    setEhFaseFinalNovaFase(false);
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div
        className="d-flex flex-row overflow-auto pb-3"
        style={{ gap: '16px', alignItems: 'flex-start' }}
      >
        {fases.map((fase, idx) => {
          const tarefasDaFase = tarefasFiltradas.filter(
            (t) => Number(t.idFase) === Number(fase.id)
          );

          return (
            <div
              key={fase.id}
              className="card border-secondary shadow-sm"
              style={{ minWidth: '300px', maxWidth: '320px', flex: '0 0 auto' }}
            >
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>{fase.nome}</strong>
                  {fase.ehFaseFinal && (
                    <span className="badge bg-success ms-2">Final</span>
                  )}
                  <div className="small text-muted">
                    Ordem: {fase.ordem} • {tarefasDaFase.length} tarefa(s)
                  </div>
                </div>

                <Stack direction="row" spacing={0}>
                  <IconButton
                    size="small"
                    aria-label="editar fase"
                    onClick={() => abrirEdicaoFase(fase)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="mover esquerda"
                    disabled={idx === 0}
                    onClick={() => moverFase(fase.id, 'esquerda')}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="mover direita"
                    disabled={idx === fases.length - 1}
                    onClick={() => moverFase(fase.id, 'direita')}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="excluir fase"
                    onClick={() => solicitarExclusaoFase(fase)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </div>

              <div className="card-body">
                {tarefasDaFase.length > 0 ? (
                  tarefasDaFase.map((tarefa) => {
                    const tagsTarefa = tarefasEtiquetas
                      .filter((te) => Number(te.idTarefa) === Number(tarefa.id))
                      .map((te) =>
                        etiquetas.find(
                          (e) => Number(e.id) === Number(te.idEtiqueta)
                        )
                      )
                      .filter(Boolean);

                    const respTarefa = responsaveisTarefas.filter(
                      (rt) => Number(rt.idTarefa) === Number(tarefa.id)
                    );

                    const prioridadeObj = prioridades.find(
                      (p) => Number(p.id) === Number(tarefa.idPrioridade)
                    );
                    const corPrioridade =
                      tarefa.corPrioridade ||
                      (prioridadeObj && prioridadeObj.cor) ||
                      '#3B82F6';

                    return (
                      <div
                        key={tarefa.id}
                        className="card mb-2 shadow-sm border-light"
                      >
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <strong
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                navigate(`/perfil-tarefa/${tarefa.id}`)
                              }
                            >
                              {tarefa.titulo}
                            </strong>
                            {tarefa.nomePrioridade && (
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: corPrioridade,
                                  color: '#fff',
                                }}
                              >
                                {tarefa.nomePrioridade}
                              </span>
                            )}
                          </div>

                          {tarefa.descricao && (
                            <p className="small text-muted mt-1 mb-1">
                              {tarefa.descricao}
                            </p>
                          )}

                          {tagsTarefa.length > 0 && (
                            <div className="mb-1">
                              {tagsTarefa.map((et) => (
                                <span
                                  key={et.id}
                                  className="badge me-1"
                                  style={{
                                    backgroundColor: et.cor || '#3B82F6',
                                    color: '#fff',
                                  }}
                                >
                                  {et.nome}
                                </span>
                              ))}
                            </div>
                          )}

                          {respTarefa.length > 0 && (
                            <div className="small text-secondary mb-2">
                              Resp.:{' '}
                              {respTarefa
                                .map((r) => r.nomeFuncionario)
                                .join(', ')}
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-center gap-1">
                            <select
                              aria-label="mover para fase"
                              className="form-select form-select-sm"
                              value={tarefa.idFase}
                              onChange={(e) =>
                                moverTarefaParaFase(tarefa, e.target.value)
                              }
                            >
                              {fases.map((fOpcao) => (
                                <option key={fOpcao.id} value={fOpcao.id}>
                                  {fOpcao.nome}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                navigate(`/perfil-tarefa/${tarefa.id}`)
                              }
                            >
                              Abrir
                            </button>

                            <IconButton
                              size="small"
                              aria-label="excluir tarefa"
                              onClick={() => setTarefaPendenteExclusao(tarefa)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="small text-muted text-center mb-0 py-2">
                    Nenhuma tarefa nesta fase.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={Boolean(faseEditando)} onClose={fecharEdicaoFase}>
        <form onSubmit={salvarEdicaoFase}>
          <DialogTitle>Editar Fase</DialogTitle>
          <DialogContent>
            <div className="mb-3 mt-1">
              <label htmlFor="inputEditarNomeFase" className="form-label fw-semibold">
                Nome da fase *
              </label>
              <input
                type="text"
                id="inputEditarNomeFase"
                maxLength={60}
                className="form-control"
                value={nomeFaseEditando}
                onChange={(e) => setNomeFaseEditando(e.target.value)}
              />
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="checkEditarFaseFinal"
                className="form-check-input"
                checked={ehFaseFinalEditando}
                onChange={(e) => setEhFaseFinalEditando(e.target.checked)}
              />
              <label htmlFor="checkEditarFaseFinal" className="form-check-label">
                Fase final (conclui tarefas)
              </label>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={fecharEdicaoFase} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={Boolean(fasePendenteExclusaoSimples)}
        onClose={() => setFasePendenteExclusaoSimples(null)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a fase{' '}
            <strong>
              {fasePendenteExclusaoSimples && fasePendenteExclusaoSimples.nome}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFasePendenteExclusaoSimples(null)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarExclusaoFaseSimples}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(fasePendenteExclusao)}
        onClose={() => setFasePendenteExclusao(null)}
        PaperProps={{
          sx: {
            border: '2px solid #d32f2f',
          },
        }}
      >
        <DialogTitle className="text-danger fw-bold">
          Atenção: Exclusão de Fase com Tarefas
        </DialogTitle>
        <DialogContent>
          <div className="alert alert-danger mb-2" role="alert">
            <strong>Perda definitiva de dados:</strong> a fase{' '}
            <strong>{fasePendenteExclusao && fasePendenteExclusao.nome}</strong>{' '}
            possui tarefas vinculadas. Ao confirmar, a fase e todas as tarefas
            alocadas nela (incluindo anotações e vínculos) serão excluídas.
          </div>
          <DialogContentText>
            Deseja realmente excluir esta fase e todas as suas tarefas?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFasePendenteExclusao(null)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarExclusaoFaseComTarefas}
            color="error"
            variant="contained"
          >
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(tarefaPendenteExclusao)}
        onClose={() => setTarefaPendenteExclusao(null)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a tarefa{' '}
            <strong>
              {tarefaPendenteExclusao && tarefaPendenteExclusao.titulo}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setTarefaPendenteExclusao(null)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarExclusaoTarefa}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default PerfilProjeto;