import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

const baseURL = `${BASE_URL}/prioridades`;

function ListagemPrioridades() {
  const navigate = useNavigate();

  const [dados, setDados] = useState(null);
  const [prioridadeSelecionada, setPrioridadeSelecionada] = useState(null);

  const cadastrar = () => {
    navigate(`/cadastro-prioridade`);
  };

  const editar = (id) => {
    navigate(`/cadastro-prioridade/${id}`);
  };

  async function excluir() {
    if (!prioridadeSelecionada) return;
    const id = prioridadeSelecionada.id;
    let url = `${baseURL}/${id}`;
    await axios
      .delete(url)
      .then(function () {
        mensagemSucesso(`Prioridade excluída com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
        setPrioridadeSelecionada(null);
      })
      .catch(function (error) {
        mensagemErro(
          error?.response?.data || `Erro ao excluir a prioridade`
        );
        setPrioridadeSelecionada(null);
      });
  }

  useEffect(() => {
    axios.get(baseURL).then((response) => {
      setDados(response.data);
    });
  }, []);

  if (!dados) return null;

  return (
    <div className='container'>
      <Card title='Listagem de Prioridades'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <div className='mb-3'>
                <button
                  type='button'
                  className='btn btn-warning fw-semibold'
                  onClick={cadastrar}
                >
                  Nova Prioridade
                </button>
              </div>
              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col'>Nome</th>
                      <th scope='col'>Cor</th>
                      <th scope='col'>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.map((dado) => (
                      <tr key={dado.id}>
                        <td>{dado.nome}</td>
                        <td>
                          <span
                            className='badge'
                            style={{
                              backgroundColor: dado.cor || '#3B82F6',
                              color: '#FFFFFF',
                              padding: '6px 10px',
                            }}
                          >
                            {dado.cor || '#3B82F6'}
                          </span>
                        </td>
                        <td>
                          <Stack spacing={1} padding={0} direction='row'>
                            <IconButton
                              aria-label='edit'
                              onClick={() => editar(dado.id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label='delete'
                              onClick={() => setPrioridadeSelecionada(dado)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Dialog
                open={Boolean(prioridadeSelecionada)}
                onClose={() => setPrioridadeSelecionada(null)}
              >
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Tem certeza que deseja excluir a prioridade{' '}
                    <strong>
                      {prioridadeSelecionada && prioridadeSelecionada.nome}
                    </strong>
                    ?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setPrioridadeSelecionada(null)}
                    color='inherit'
                  >
                    Cancelar
                  </Button>
                  <Button onClick={excluir} color='error' variant='contained'>
                    Excluir
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListagemPrioridades;