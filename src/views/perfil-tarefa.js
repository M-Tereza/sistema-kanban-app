import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';
import { formatarInstant } from '../utils/formatters';

function PerfilTarefa() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const [tarefa, setTarefa] = useState(null);
  const [anotacoes, setAnotacoes] = useState(null);
  const [textoAnotacao, setTextoAnotacao] = useState('');
  const [idAnotacaoEditando, setIdAnotacaoEditando] = useState(null);

  const [responsaveis, setResponsaveis] = useState([]);
  const [participantesProjeto, setParticipantesProjeto] = useState([]);
  const [idFuncionarioProjetoNovo, setIdFuncionarioProjetoNovo] = useState('');

  const [etiquetasTarefa, setEtiquetasTarefa] = useState([]);
  const [etiquetasProjeto, setEtiquetasProjeto] = useState([]);
  const [idEtiquetaNova, setIdEtiquetaNova] = useState('');

  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState(null);

  const carregarDetalhes = useCallback(async () => {
    try {
      const [resTarefa, resAnotacoes, resResp, resEtqTarefa] =
        await Promise.all([
          api.get(`/tarefas/${idParam}`),
          api.get(`/anotacoes/tarefa/${idParam}`),
          api.get(`/responsaveis-tarefa/tarefa/${idParam}`),
          api.get(`/tarefas-etiquetas/tarefa/${idParam}`),
        ]);

      setTarefa(resTarefa.data);
      setAnotacoes(resAnotacoes.data);
      setResponsaveis(resResp.data);
      setEtiquetasTarefa(resEtqTarefa.data);

      if (resTarefa.data && resTarefa.data.idProjeto) {
        const [resPart, resEtqProj] = await Promise.all([
          api.get(
            `/funcionarios-projeto/projeto/${resTarefa.data.idProjeto}`
          ),
          api.get(`/etiquetas/projeto/${resTarefa.data.idProjeto}`),
        ]);
        setParticipantesProjeto(resPart.data);
        setEtiquetasProjeto(resEtqProj.data);
      }
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao carregar detalhes da tarefa.'
      );
      setTarefa(false);
      setAnotacoes([]);
    }
  }, [idParam]);

  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  async function excluirTarefa() {
    if (!tarefa) return;
    const idProjetoDestino = tarefa.idProjeto;
    try {
      await api.delete(`/tarefas/${tarefa.id}`);
      mensagemSucesso('Tarefa excluída com sucesso!');
      setConfirmacaoExclusao(null);
      if (idProjetoDestino) {
        navigate(`/perfil-projeto/${idProjetoDestino}`);
      } else {
        navigate('/listagem-projetos');
      }
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao excluir tarefa.'
      );
      setConfirmacaoExclusao(null);
    }
  }

  async function salvarAnotacao(e) {
    e.preventDefault();
    if (!textoAnotacao || !textoAnotacao.trim()) {
      mensagemErro('Digite o texto da anotação.');
      return;
    }

    try {
      if (idAnotacaoEditando == null) {
        await api.post('/anotacoes', {
          texto: textoAnotacao.trim(),
          idTarefa: Number(idParam),
        });
        mensagemSucesso('Anotação adicionada com sucesso!');
      } else {
        await api.put(`/anotacoes/${idAnotacaoEditando}`, {
          id: idAnotacaoEditando,
          texto: textoAnotacao.trim(),
          idTarefa: Number(idParam),
        });
        mensagemSucesso('Anotação atualizada com sucesso!');
      }
      setTextoAnotacao('');
      setIdAnotacaoEditando(null);
      carregarDetalhes();
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao salvar anotação.'
      );
    }
  }

  function excluirAnotacao(id) {
    api
      .delete(`/anotacoes/${id}`)
      .then(() => {
        mensagemSucesso('Anotação excluída com sucesso!');
        setAnotacoes(anotacoes.filter((item) => item.id !== id));
        setConfirmacaoExclusao(null);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao excluir anotação.'
        );
        setConfirmacaoExclusao(null);
      });
  }

  async function adicionarResponsavel() {
    if (!idFuncionarioProjetoNovo) return;
    try {
      await api.post('/responsaveis-tarefa', {
        idTarefa: Number(idParam),
        idFuncionarioProjeto: Number(idFuncionarioProjetoNovo),
      });
      mensagemSucesso('Responsável atribuído com sucesso!');
      setIdFuncionarioProjetoNovo('');
      carregarDetalhes();
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao atribuir responsável.'
      );
    }
  }

  function removerResponsavel(id) {
    api
      .delete(`/responsaveis-tarefa/${id}`)
      .then(() => {
        mensagemSucesso('Responsável removido com sucesso!');
        setResponsaveis(responsaveis.filter((r) => r.id !== id));
        setConfirmacaoExclusao(null);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao remover responsável.'
        );
        setConfirmacaoExclusao(null);
      });
  }

  async function adicionarEtiqueta() {
    if (!idEtiquetaNova) return;
    try {
      await api.post('/tarefas-etiquetas', {
        idTarefa: Number(idParam),
        idEtiqueta: Number(idEtiquetaNova),
      });
      mensagemSucesso('Etiqueta vinculada com sucesso!');
      setIdEtiquetaNova('');
      carregarDetalhes();
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao vincular etiqueta.'
      );
    }
  }

  function removerEtiqueta(id) {
    api
      .delete(`/tarefas-etiquetas/${id}`)
      .then(() => {
        mensagemSucesso('Etiqueta desvinculada com sucesso!');
        setEtiquetasTarefa(etiquetasTarefa.filter((te) => te.id !== id));
        setConfirmacaoExclusao(null);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao desvincular etiqueta.'
        );
        setConfirmacaoExclusao(null);
      });
  }

  function executarConfirmacaoExclusao() {
    if (!confirmacaoExclusao) return;
    if (confirmacaoExclusao.tipo === 'tarefa') {
      excluirTarefa();
    } else if (confirmacaoExclusao.tipo === 'anotacao') {
      excluirAnotacao(confirmacaoExclusao.item.id);
    } else if (confirmacaoExclusao.tipo === 'responsavel') {
      removerResponsavel(confirmacaoExclusao.item.id);
    } else if (confirmacaoExclusao.tipo === 'etiqueta') {
      removerEtiqueta(confirmacaoExclusao.item.id);
    }
  }

  if (!tarefa || !anotacoes) return null;

  return (
    <Card
      title={tarefa.titulo ? `Tarefa — ${tarefa.titulo}` : 'Detalhes da Tarefa'}
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <Stack direction="row" spacing={1}>
          <button
            type="button"
            className="btn btn-warning text-white fw-semibold"
            onClick={() => navigate(`/cadastro-tarefa/${tarefa.id}`)}
          >
            Editar Tarefa
          </button>
          <button
            type="button"
            className="btn btn-danger fw-semibold"
            onClick={() =>
              setConfirmacaoExclusao({
                tipo: 'tarefa',
                item: tarefa,
                mensagem: (
                  <>
                    Tem certeza que deseja excluir a tarefa{' '}
                    <strong>{tarefa.titulo}</strong>?
                  </>
                ),
              })
            }
          >
            Excluir Tarefa
          </button>
        </Stack>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() =>
            tarefa.idProjeto
              ? navigate(`/perfil-projeto/${tarefa.idProjeto}`)
              : navigate('/listagem-projetos')
          }
        >
          ← Voltar ao Quadro
        </button>
      </div>

      <div className="mb-3">
        <p>
          <strong>Projeto:</strong> {tarefa.tituloProjeto || '—'}
        </p>
        <p>
          <strong>Fase:</strong> {tarefa.nomeFase || '—'}
        </p>
        <p>
          <strong>Prioridade:</strong>{' '}
          {tarefa.nomePrioridade ? (
            <span
              className="badge"
              style={{
                backgroundColor: tarefa.corPrioridade || '#3B82F6',
                color: '#fff',
              }}
            >
              {tarefa.nomePrioridade}
            </span>
          ) : (
            'Sem prioridade'
          )}
        </p>
        <p>
          <strong>Data de Criação:</strong> {formatarInstant(tarefa.dataCriacao)}
        </p>
        <p>
          <strong>Data Limite:</strong> {formatarInstant(tarefa.dataLimite)}
        </p>
        <p>
          <strong>Descrição:</strong> {tarefa.descricao || 'Sem descrição.'}
        </p>
      </div>

      <hr />
      <h5>Responsáveis pela Tarefa</h5>
      <div className="row g-2 mb-2">
        <div className="col-md-8">
          <select
            aria-label="selecionar responsável"
            className="form-select"
            value={idFuncionarioProjetoNovo}
            onChange={(e) => setIdFuncionarioProjetoNovo(e.target.value)}
          >
            <option value="">Selecione um participante do projeto</option>
            {participantesProjeto.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nomeFuncionario}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <button
            type="button"
            className="btn btn-outline-primary w-100"
            onClick={adicionarResponsavel}
          >
            Atribuir Responsável
          </button>
        </div>
      </div>

      <ul className="list-group mb-3">
        {responsaveis.map((r) => (
          <li
            key={r.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{r.nomeFuncionario}</span>
            <IconButton
              size="small"
              aria-label="remover responsável"
              onClick={() =>
                setConfirmacaoExclusao({
                  tipo: 'responsavel',
                  item: r,
                  mensagem: (
                    <>
                      Tem certeza que deseja remover o responsável{' '}
                      <strong>{r.nomeFuncionario}</strong> desta tarefa?
                    </>
                  ),
                })
              }
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </li>
        ))}
      </ul>

      <hr />
      <h5>Etiquetas da Tarefa</h5>
      <div className="row g-2 mb-2">
        <div className="col-md-8">
          <select
            aria-label="selecionar etiqueta"
            className="form-select"
            value={idEtiquetaNova}
            onChange={(e) => setIdEtiquetaNova(e.target.value)}
          >
            <option value="">Selecione uma etiqueta do projeto</option>
            {etiquetasProjeto.map((et) => (
              <option key={et.id} value={et.id}>
                {et.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <button
            type="button"
            className="btn btn-outline-primary w-100"
            onClick={adicionarEtiqueta}
          >
            Vincular Etiqueta
          </button>
        </div>
      </div>

      <ul className="list-group mb-3">
        {etiquetasTarefa.map((te) => {
          const etqInfo = etiquetasProjeto.find(
            (e) => Number(e.id) === Number(te.idEtiqueta)
          );
          return (
            <li
              key={te.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span
                className="badge"
                style={{
                  backgroundColor: (etqInfo && etqInfo.cor) || '#3B82F6',
                  color: '#fff',
                }}
              >
                {te.nomeEtiqueta}
              </span>
              <IconButton
                size="small"
                aria-label="desvincular etiqueta"
                onClick={() =>
                  setConfirmacaoExclusao({
                    tipo: 'etiqueta',
                    item: te,
                    mensagem: (
                      <>
                        Tem certeza que deseja desvincular a etiqueta{' '}
                        <strong>{te.nomeEtiqueta}</strong> desta tarefa?
                      </>
                    ),
                  })
                }
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </li>
          );
        })}
      </ul>

      <hr />
      <h5>Anotações</h5>
      <form onSubmit={salvarAnotacao} className="mb-3">
        <FormGroup
          label={
            idAnotacaoEditando == null
              ? 'Nova Anotação *'
              : 'Editar Anotação *'
          }
          htmlFor="inputTextoAnotacao"
        >
          <textarea
            id="inputTextoAnotacao"
            maxLength={500}
            rows={2}
            className="form-control"
            value={textoAnotacao}
            onChange={(e) => setTextoAnotacao(e.target.value)}
          />
        </FormGroup>
        <Stack spacing={1} direction="row" className="mt-2">
          <button type="submit" className="btn btn-success">
            {idAnotacaoEditando == null
              ? 'Adicionar Anotação'
              : 'Atualizar Anotação'}
          </button>
          {idAnotacaoEditando != null && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIdAnotacaoEditando(null);
                setTextoAnotacao('');
              }}
            >
              Cancelar Edição
            </button>
          )}
        </Stack>
      </form>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Anotação</th>
              <th>Data</th>
              <th style={{ width: '110px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {anotacoes.map((nota) => (
              <tr key={nota.id}>
                <td>{nota.texto}</td>
                <td>{formatarInstant(nota.dataCriacao)}</td>
                <td>
                  <Stack spacing={0.5} direction="row">
                    <IconButton
                      size="small"
                      aria-label="editar anotação"
                      onClick={() => {
                        setIdAnotacaoEditando(nota.id);
                        setTextoAnotacao(nota.texto || '');
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="excluir anotação"
                      onClick={() =>
                        setConfirmacaoExclusao({
                          tipo: 'anotacao',
                          item: nota,
                          mensagem: (
                            <>
                              Tem certeza que deseja excluir esta anotação?
                            </>
                          ),
                        })
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={Boolean(confirmacaoExclusao)}
        onClose={() => setConfirmacaoExclusao(null)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmacaoExclusao && confirmacaoExclusao.mensagem}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmacaoExclusao(null)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={executarConfirmacaoExclusao}
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

export default PerfilTarefa;