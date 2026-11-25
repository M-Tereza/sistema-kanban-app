import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/axios';
import { mensagemSucesso, mensagemErro } from '../components/toastr';

function PerfilTarefa() {
  const navigate = useNavigate();
  const { idParam } = useParams();

  const [tarefa, setTarefa] = useState(null);
  const [etiquetasProjeto, setEtiquetasProjeto] = useState([]);
  const [vinculosEtiquetas, setVinculosEtiquetas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [participantesProjeto, setParticipantesProjeto] = useState([]);
  const [anotacoes, setAnotacoes] = useState([]);

  const [idEtiquetaSelecionada, setIdEtiquetaSelecionada] = useState('');
  const [idFpSelecionado, setIdFpSelecionado] = useState('');
  const [textoAnotacao, setTextoAnotacao] = useState('');
  const [editandoAnotacaoId, setEditandoAnotacaoId] = useState(null);

  const carregarTarefa = useCallback(() => {
    if (!idParam) return;

    api
      .get(`/tarefas/${idParam}`)
      .then((res) => {
        const t = res.data;
        setTarefa(t);

        if (t.idProjeto) {
          api
            .get(`/etiquetas/projeto/${t.idProjeto}`)
            .then((r) => setEtiquetasProjeto(r.data || []))
            .catch(() => {});

          api
            .get(`/funcionarios-projeto/projeto/${t.idProjeto}`)
            .then((r) => setParticipantesProjeto(r.data || []))
            .catch(() => {});
        }
      })
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao carregar tarefa.')
      );

    api
      .get(`/tarefas-etiquetas/tarefa/${idParam}`)
      .then((res) => setVinculosEtiquetas(res.data || []))
      .catch(() => {});

    api
      .get(`/responsaveis-tarefa/tarefa/${idParam}`)
      .then((res) => setResponsaveis(res.data || []))
      .catch(() => {});

    api
      .get(`/anotacoes/tarefa/${idParam}`)
      .then((res) => setAnotacoes(res.data || []))
      .catch(() => {});
  }, [idParam]);

  useEffect(() => {
    carregarTarefa();
  }, [carregarTarefa]);

  if (!tarefa) return null;

  const vincularEtiqueta = (e) => {
    e.preventDefault();
    if (!idEtiquetaSelecionada) return;

    api
      .post('/tarefas-etiquetas', {
        idTarefa: Number(idParam),
        idEtiqueta: Number(idEtiquetaSelecionada),
      })
      .then((res) => {
        setVinculosEtiquetas((prev) => [...prev, res.data]);
        setIdEtiquetaSelecionada('');
        mensagemSucesso('Etiqueta vinculada à tarefa!');
      })
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao vincular etiqueta.')
      );
  };

  const desvincularEtiqueta = (vinculoId) => {
    api
      .delete(`/tarefas-etiquetas/${vinculoId}`)
      .then(() => {
        setVinculosEtiquetas((prev) => prev.filter((v) => v.id !== vinculoId));
        mensagemSucesso('Etiqueta removida da tarefa!');
      })
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao remover etiqueta.')
      );
  };

  const adicionarResponsavel = (e) => {
    e.preventDefault();
    if (!idFpSelecionado) return;

    api
      .post('/responsaveis-tarefa', {
        idTarefa: Number(idParam),
        idFuncionarioProjeto: Number(idFpSelecionado),
      })
      .then((res) => {
        setResponsaveis((prev) => [...prev, res.data]);
        setIdFpSelecionado('');
        mensagemSucesso('Responsável atribuído!');
      })
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao atribuir responsável.')
      );
  };

  const removerResponsavel = (respId) => {
    api
      .delete(`/responsaveis-tarefa/${respId}`)
      .then(() => {
        setResponsaveis((prev) => prev.filter((r) => r.id !== respId));
        mensagemSucesso('Responsável removido!');
      })
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao remover responsável.')
      );
  };

  const salvarAnotacao = (e) => {
    e.preventDefault();

    const req = editandoAnotacaoId
      ? api.put(`/anotacoes/${editandoAnotacaoId}`, {
          texto: textoAnotacao,
          idTarefa: Number(idParam),
        })
      : api.post('/anotacoes', {
          texto: textoAnotacao,
          idTarefa: Number(idParam),
        });

    req
      .then((res) => {
        if (editandoAnotacaoId) {
          setAnotacoes((prev) =>
            prev.map((a) => (a.id === editandoAnotacaoId ? res.data : a))
          );
          mensagemSucesso('Anotação atualizada!');
        } else {
          setAnotacoes((prev) => [...prev, res.data]);
          mensagemSucesso('Anotação adicionada!');
        }
        setTextoAnotacao('');
        setEditandoAnotacaoId(null);
      })
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao salvar anotação.')
      );
  };

  const excluirAnotacao = (anotacaoId) => {
    api
      .delete(`/anotacoes/${anotacaoId}`)
      .then(() => {
        setAnotacoes((prev) => prev.filter((a) => a.id !== anotacaoId));
        mensagemSucesso('Anotação excluída!');
      })
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao excluir anotação.')
      );
  };

  const corPrioridade = tarefa.corPrioridade || '#3B82F6';

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>{tarefa.titulo}</h3>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-warning"
            onClick={() => navigate(`/cadastro-tarefa/${tarefa.id}`)}
          >
            Editar Tarefa
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate(
                tarefa.idProjeto
                  ? `/perfil-projeto/${tarefa.idProjeto}`
                  : '/listagem-projetos'
              )
            }
          >
            Voltar ao Quadro
          </button>
        </div>
      </div>

      {/* Detalhes da Tarefa */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-2 d-flex flex-wrap align-items-center gap-2">
            <span>
              <strong>Projeto:</strong> {tarefa.tituloProjeto || '-'}
            </span>
            <span>|</span>
            <span>
              <strong>Fase:</strong> {tarefa.nomeFase || '-'}
            </span>
            <span>|</span>
            <span>
              <strong>Prioridade:</strong>{' '}
              {tarefa.nomePrioridade ? (
                <span
                  className="badge"
                  style={{
                    backgroundColor: corPrioridade,
                    color: '#FFFFFF',
                  }}
                >
                  {tarefa.nomePrioridade}
                </span>
              ) : (
                'Nenhuma'
              )}
            </span>
          </div>

          {tarefa.descricao && <p className="mb-2">{tarefa.descricao}</p>}

          {tarefa.dataLimite && (
            <small className="text-muted">
              Data limite: {new Date(tarefa.dataLimite).toLocaleString('pt-BR')}
            </small>
          )}
        </div>
      </div>

      {/* Etiquetas Vinculadas */}
      <div className="card mb-4">
        <div className="card-header">
          <strong>Etiquetas</strong>
        </div>
        <div className="card-body">
          <div className="mb-3 d-flex flex-wrap gap-2">
            {vinculosEtiquetas.length === 0 ? (
              <span className="text-muted">Nenhuma etiqueta vinculada.</span>
            ) : (
              vinculosEtiquetas.map((ve) => {
                const etObj = etiquetasProjeto.find(
                  (e) => e.id === ve.idEtiqueta
                );
                return (
                  <span
                    key={ve.id}
                    className="badge d-inline-flex align-items-center gap-2"
                    style={{
                      backgroundColor: etObj?.cor || '#3B82F6',
                      color: '#FFFFFF',
                      padding: '6px 10px',
                    }}
                  >
                    <span>{ve.nomeEtiqueta}</span>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      style={{ width: '0.55em', height: '0.55em' }}
                      onClick={() => desvincularEtiqueta(ve.id)}
                      title="Remover etiqueta"
                    />
                  </span>
                );
              })
            )}
          </div>

          <form onSubmit={vincularEtiqueta} className="d-flex gap-2">
            <select
              className="form-select"
              style={{ maxWidth: '300px' }}
              value={idEtiquetaSelecionada}
              onChange={(e) => setIdEtiquetaSelecionada(e.target.value)}
            >
              <option value="">Selecionar etiqueta do projeto...</option>
              {etiquetasProjeto.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.nome}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              Vincular
            </button>
          </form>
        </div>
      </div>

      {/* Responsáveis */}
      <div className="card mb-4">
        <div className="card-header">
          <strong>Responsáveis</strong>
        </div>
        <div className="card-body">
          <ul className="list-group mb-3">
            {responsaveis.length === 0 ? (
              <li className="list-group-item text-muted">
                Nenhum responsável atribuído.
              </li>
            ) : (
              responsaveis.map((r) => (
                <li
                  key={r.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>{r.nomeFuncionario}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removerResponsavel(r.id)}
                  >
                    Remover
                  </button>
                </li>
              ))
            )}
          </ul>

          <form onSubmit={adicionarResponsavel} className="d-flex gap-2">
            <select
              className="form-select"
              style={{ maxWidth: '300px' }}
              value={idFpSelecionado}
              onChange={(e) => setIdFpSelecionado(e.target.value)}
            >
              <option value="">Selecionar participante do projeto...</option>
              {participantesProjeto.map((fp) => (
                <option key={fp.id} value={fp.id}>
                  {fp.nomeFuncionario}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              Atribuir
            </button>
          </form>
        </div>
      </div>

      {/* Anotações */}
      <div className="card mb-4">
        <div className="card-header">
          <strong>Anotações</strong>
        </div>
        <div className="card-body">
          <form onSubmit={salvarAnotacao} className="mb-3">
            <div className="mb-2">
              <textarea
                className="form-control"
                rows={2}
                maxLength={500}
                value={textoAnotacao}
                onChange={(e) => setTextoAnotacao(e.target.value)}
                placeholder="Escreva uma anotação sobre a tarefa..."
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success btn-sm">
                {editandoAnotacaoId ? 'Atualizar Anotação' : 'Adicionar Anotação'}
              </button>
              {editandoAnotacaoId && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setEditandoAnotacaoId(null);
                    setTextoAnotacao('');
                  }}
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>

          <ul className="list-group">
            {anotacoes.length === 0 ? (
              <li className="list-group-item text-muted">
                Nenhuma anotação registrada.
              </li>
            ) : (
              anotacoes.map((a) => (
                <li
                  key={a.id}
                  className="list-group-item d-flex justify-content-between align-items-start gap-2"
                >
                  <div>
                    <div>{a.texto}</div>
                    {a.dataCriacao && (
                      <small className="text-muted">
                        {new Date(a.dataCriacao).toLocaleString('pt-BR')}
                      </small>
                    )}
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-warning"
                      onClick={() => {
                        setEditandoAnotacaoId(a.id);
                        setTextoAnotacao(a.texto);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => excluirAnotacao(a.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PerfilTarefa;