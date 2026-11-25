import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';

function ListagemFuncionarios() {
  const navigate = useNavigate();
  const endpoint = '/funcionarios';

  const [dadosFuncionarios, setDadosFuncionarios] = useState(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

  useEffect(() => {
    api
      .get(endpoint)
      .then((response) => {
        setDadosFuncionarios(response.data);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao listar funcionários.'
        );
        setDadosFuncionarios([]);
      });
  }, []);

  function excluir() {
    if (!funcionarioSelecionado) return;

    api
      .delete(`${endpoint}/${funcionarioSelecionado.id}`)
      .then(() => {
        mensagemSucesso('Funcionário excluído com sucesso!');
        setDadosFuncionarios(
          dadosFuncionarios.filter(
            (item) => item.id !== funcionarioSelecionado.id
          )
        );
        setFuncionarioSelecionado(null);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao excluir o funcionário.'
        );
        setFuncionarioSelecionado(null);
      });
  }

  if (!dadosFuncionarios) return null;

  return (
    <Card title="Funcionários">
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-warning text-white fw-semibold"
          onClick={() => navigate('/cadastro-funcionario')}
        >
          Novo Funcionário
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cargo</th>
              <th>Telefone</th>
              <th style={{ width: '140px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dadosFuncionarios.length > 0 ? (
              dadosFuncionarios.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td className="fw-medium">{funcionario.nome}</td>
                  <td>{funcionario.email}</td>
                  <td>
                    {funcionario.nomeCargo ? (
                      <span className="badge bg-info text-dark">
                        {funcionario.nomeCargo}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{funcionario.telefone || '—'}</td>
                  <td>
                    <Stack spacing={0.5} direction="row">
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label="perfil"
                        onClick={() =>
                          navigate(`/perfil-funcionario/${funcionario.id}`)
                        }
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        aria-label="editar"
                        onClick={() =>
                          navigate(`/cadastro-funcionario/${funcionario.id}`)
                        }
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="excluir"
                        onClick={() => setFuncionarioSelecionado(funcionario)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  Nenhum funcionário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={Boolean(funcionarioSelecionado)}
        onClose={() => setFuncionarioSelecionado(null)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o funcionário{' '}
            <strong>
              {funcionarioSelecionado && funcionarioSelecionado.nome}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFuncionarioSelecionado(null)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button onClick={excluir} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default ListagemFuncionarios;