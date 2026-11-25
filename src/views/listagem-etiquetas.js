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

function ListagemEtiquetas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const endpoint = '/etiquetas';

  const idProjeto =
    searchParams.get('idProjeto') ||
    (location.state && location.state.idProjeto
      ? String(location.state.idProjeto)
      : '');

  const [dadosEtiquetas, setDadosEtiquetas] = useState(null);
  const [etiquetaSelecionada, setEtiquetaSelecionada] = useState(null);

  useEffect(() => {
    const request = idProjeto
      ? api.get(`${endpoint}/projeto/${idProjeto}`)
      : api.get(endpoint);

    request
      .then((res) => setDadosEtiquetas(res.data))
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao listar etiquetas.'
        );
        setDadosEtiquetas([]);
      });
  }, [idProjeto]);

  function excluir() {
    if (!etiquetaSelecionada) return;

    api
      .delete(`${endpoint}/${etiquetaSelecionada.id}`)
      .then(() => {
        mensagemSucesso('Etiqueta excluída com sucesso!');
        setDadosEtiquetas(
          dadosEtiquetas.filter((item) => item.id !== etiquetaSelecionada.id)
        );
        setEtiquetaSelecionada(null);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao excluir etiqueta.'
        );
        setEtiquetaSelecionada(null);
      });
  }

  if (!dadosEtiquetas) return null;

  return (
    <Card title="Etiquetas">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <button
          type="button"
          className="btn btn-warning text-white fw-semibold"
          onClick={() =>
            navigate(
              idProjeto
                ? `/cadastro-etiqueta?idProjeto=${idProjeto}`
                : '/cadastro-etiqueta'
            )
          }
        >
          Nova Etiqueta
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
              <th>Nome</th>
              <th>Cor</th>
              <th>Projeto</th>
              <th style={{ width: '120px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dadosEtiquetas.length > 0 ? (
              dadosEtiquetas.map((etiqueta) => (
                <tr key={etiqueta.id}>
                  <td className="fw-medium">{etiqueta.nome}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: etiqueta.cor || '#3B82F6',
                        color: '#fff',
                      }}
                    >
                      {etiqueta.cor || '#3B82F6'}
                    </span>
                  </td>
                  <td>{etiqueta.tituloProjeto || '—'}</td>
                  <td>
                    <Stack spacing={0.5} direction="row">
                      <IconButton
                        size="small"
                        aria-label="editar"
                        onClick={() =>
                          navigate(
                            idProjeto
                              ? `/cadastro-etiqueta/${etiqueta.id}?idProjeto=${idProjeto}`
                              : `/cadastro-etiqueta/${etiqueta.id}`
                          )
                        }
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="excluir"
                        onClick={() => setEtiquetaSelecionada(etiqueta)}
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
                  Nenhuma etiqueta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={Boolean(etiquetaSelecionada)}
        onClose={() => setEtiquetaSelecionada(null)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a etiqueta{' '}
            <strong>{etiquetaSelecionada && etiquetaSelecionada.nome}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEtiquetaSelecionada(null)}
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

export default ListagemEtiquetas;