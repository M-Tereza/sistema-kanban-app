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

function ListagemCargos() {
  const navigate = useNavigate();
  const endpoint = '/cargos';

  const [dadosCargos, setDadosCargos] = useState(null);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);

  useEffect(() => {
    api
      .get(endpoint)
      .then((response) => {
        setDadosCargos(response.data);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao listar cargos.'
        );
        setDadosCargos([]);
      });
  }, []);

  function excluir() {
    if (!cargoSelecionado) return;

    api
      .delete(`${endpoint}/${cargoSelecionado.id}`)
      .then(() => {
        mensagemSucesso('Cargo excluído com sucesso!');
        setDadosCargos(
          dadosCargos.filter((item) => item.id !== cargoSelecionado.id)
        );
        setCargoSelecionado(null);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao excluir o cargo.'
        );
        setCargoSelecionado(null);
      });
  }

  if (!dadosCargos) return null;

  return (
    <Card title="Cargos">
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-warning text-white fw-semibold"
          onClick={() => navigate('/cadastro-cargo')}
        >
          Novo Cargo
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
            {dadosCargos.length > 0 ? (
              dadosCargos.map((cargo) => (
                <tr key={cargo.id}>
                  <td className="fw-medium">{cargo.nome}</td>
                  <td>
                    <Stack spacing={0.5} direction="row">
                      <IconButton
                        size="small"
                        aria-label="editar"
                        onClick={() => navigate(`/cadastro-cargo/${cargo.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="excluir"
                        onClick={() => setCargoSelecionado(cargo)}
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
                  Nenhum cargo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={Boolean(cargoSelecionado)}
        onClose={() => setCargoSelecionado(null)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o cargo{' '}
            <strong>{cargoSelecionado && cargoSelecionado.nome}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCargoSelecionado(null)} color="inherit">
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

export default ListagemCargos;