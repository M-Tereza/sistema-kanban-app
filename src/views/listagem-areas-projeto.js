import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function ListagemAreasProjeto() {
  const navigate = useNavigate();
  const endpoint = '/areas-projeto';

  const [dadosAreasProjeto, setDadosAreasProjeto] = useState(null);
  const [areaSelecionada, setAreaSelecionada] = useState(null);

  useEffect(() => {
    api
      .get(endpoint)
      .then((response) => {
        setDadosAreasProjeto(response.data);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao listar áreas de projeto.'
        );
        setDadosAreasProjeto([]);
      });
  }, []);

  function excluir() {
    if (!areaSelecionada) return;

    api
      .delete(`${endpoint}/${areaSelecionada.id}`)
      .then(() => {
        mensagemSucesso('Área de projeto excluída com sucesso!');
        setDadosAreasProjeto(
          dadosAreasProjeto.filter((item) => item.id !== areaSelecionada.id)
        );
        setAreaSelecionada(null);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao excluir a área de projeto.'
        );
        setAreaSelecionada(null);
      });
  }

  if (!dadosAreasProjeto) return null;

  return (
    <Card title="Áreas de Projeto">
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-warning text-white fw-semibold"
          onClick={() => navigate('/cadastro-area-projeto')}
        >
          Nova Área de Projeto
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Nome</th>
              <th style={{ width: '120px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dadosAreasProjeto.length > 0 ? (
              dadosAreasProjeto.map((area) => (
                <tr key={area.id}>
                  <td className="fw-medium">{area.nome}</td>
                  <td>
                    <Stack spacing={0.5} direction="row">
                      <IconButton
                        size="small"
                        color="warning"
                        aria-label="editar"
                        onClick={() =>
                          navigate(`/cadastro-area-projeto/${area.id}`)
                        }
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="excluir"
                        onClick={() => setAreaSelecionada(area)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center text-muted py-4">
                  Nenhuma área de projeto cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={Boolean(areaSelecionada)}
        onClose={() => setAreaSelecionada(null)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a área de projeto{' '}
            <strong>{areaSelecionada && areaSelecionada.nome}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAreaSelecionada(null)} color="inherit">
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

export default ListagemAreasProjeto;