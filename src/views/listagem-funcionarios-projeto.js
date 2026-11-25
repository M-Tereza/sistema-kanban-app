import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';

function ListagemFuncionariosProjeto() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const endpoint = '/funcionarios-projeto';

  const idProjeto =
    searchParams.get('idProjeto') ||
    (location.state && location.state.idProjeto
      ? String(location.state.idProjeto)
      : '');

  const [dadosFuncionariosProjeto, setDadosFuncionariosProjeto] =
    useState(null);
  const [vinculoSelecionado, setVinculoSelecionado] = useState(null);

  useEffect(() => {
    if (!idProjeto) {
      setDadosFuncionariosProjeto([]);
      return;
    }

    api
      .get(`${endpoint}/projeto/${idProjeto}`)
      .then((res) => setDadosFuncionariosProjeto(res.data))
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao listar participantes do projeto.'
        );
        setDadosFuncionariosProjeto([]);
      });
  }, [idProjeto]);

  function excluir() {
    if (!vinculoSelecionado) return;

    api
      .delete(`${endpoint}/${vinculoSelecionado.id}`)
      .then(() => {
        mensagemSucesso('Vínculo removido com sucesso!');
        setDadosFuncionariosProjeto(
          dadosFuncionariosProjeto.filter(
            (item) => item.id !== vinculoSelecionado.id
          )
        );
        setVinculoSelecionado(null);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao remover vínculo.'
        );
        setVinculoSelecionado(null);
      });
  }

  if (!dadosFuncionariosProjeto) return null;

  return (
    <Card title="Participações e Responsáveis do Projeto">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <button
          type="button"
          className="btn btn-warning text-white fw-semibold"
          onClick={() =>
            navigate(
              idProjeto
                ? `/cadastro-funcionario-projeto?idProjeto=${idProjeto}`
                : '/cadastro-funcionario-projeto'
            )
          }
        >
          Nova Participação
        </button>

        {idProjeto && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`/perfil-projeto/${idProjeto}`)}
          >
            ← Voltar ao Projeto
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Funcionário</th>
              <th>Projeto</th>
              <th>Responsável</th>
              <th style={{ width: '120px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dadosFuncionariosProjeto.length > 0 ? (
              dadosFuncionariosProjeto.map((vinculo) => (
                <tr key={vinculo.id}>
                  <td className="fw-medium">{vinculo.nomeFuncionario}</td>
                  <td>{vinculo.tituloProjeto}</td>
                  <td>
                    {vinculo.ehResponsavel ? (
                      <span className="badge bg-success">Responsável</span>
                    ) : (
                      <span className="badge bg-secondary">Participante</span>
                    )}
                  </td>
                  <td>
                    <Stack spacing={0.5} direction="row">
                      <IconButton
                        size="small"
                        color="warning"
                        aria-label="editar"
                        onClick={() =>
                          navigate(
                            idProjeto
                              ? `/cadastro-funcionario-projeto/${vinculo.id}?idProjeto=${idProjeto}`
                              : `/cadastro-funcionario-projeto/${vinculo.id}`
                          )
                        }
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="excluir"
                        onClick={() => setVinculoSelecionado(vinculo)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  Nenhuma participação encontrada para este projeto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={Boolean(vinculoSelecionado)}
        onClose={() => setVinculoSelecionado(null)}
      >
        <DialogTitle>Confirmar remoção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover a participação de{' '}
            <strong>
              {vinculoSelecionado && vinculoSelecionado.nomeFuncionario}
            </strong>{' '}
            neste projeto?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setVinculoSelecionado(null)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button onClick={excluir} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default ListagemFuncionariosProjeto;