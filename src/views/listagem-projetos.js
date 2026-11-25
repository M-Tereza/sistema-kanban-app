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
import { useDebounce } from '../utils/useDebounce';
import { correspondeBusca } from '../utils/kanban';

function ListagemProjetos() {
  const navigate = useNavigate();
  const endpoint = '/projetos';

  const [dadosProjetos, setDadosProjetos] = useState(null);
  const [dadosAreasProjeto, setDadosAreasProjeto] = useState([]);
  const [filtroArea, setFiltroArea] = useState('');
  const [busca, setBusca] = useState('');
  const [openConfirmacao, setOpenConfirmacao] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const buscaDebounced = useDebounce(busca, 300);

  useEffect(() => {
    api
      .get(endpoint)
      .then((response) => {
        setDadosProjetos(response.data);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao listar projetos.'
        );
        setDadosProjetos([]);
      });

    api
      .get('/areas-projeto')
      .then((response) => {
        setDadosAreasProjeto(response.data);
      })
      .catch(() => setDadosAreasProjeto([]));
  }, []);

  function abrirConfirmacao(projeto) {
    setProjetoSelecionado(projeto);
    setOpenConfirmacao(true);
  }

  function fecharConfirmacao() {
    setOpenConfirmacao(false);
    setProjetoSelecionado(null);
  }

  function excluir() {
    if (!projetoSelecionado) return;

    api
      .delete(`${endpoint}/${projetoSelecionado.id}`)
      .then(() => {
        mensagemSucesso('Projeto excluído com sucesso!');
        setDadosProjetos(
          dadosProjetos.filter((item) => item.id !== projetoSelecionado.id)
        );
        fecharConfirmacao();
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao excluir o projeto.'
        );
        fecharConfirmacao();
      });
  }

  if (!dadosProjetos) return null;

  const projetosFiltrados = dadosProjetos.filter((projeto) => {
    const bateArea =
      !filtroArea || String(projeto.idAreaProjeto || '') === String(filtroArea);
    const bateBusca = correspondeBusca(
      [projeto.titulo, projeto.descricao, projeto.nomeAreaProjeto],
      buscaDebounced
    );
    return bateArea && bateBusca;
  });

  return (
    <Card title="Projetos">
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          className="btn btn-warning text-white fw-semibold"
          onClick={() => navigate('/cadastro-projeto')}
        >
          Novo Projeto
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="inputBuscaProjeto" className="form-label fw-semibold">
            Buscar
          </label>
          <input
            type="text"
            id="inputBuscaProjeto"
            className="form-control"
            placeholder="Buscar por título, descrição ou área..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="selectFiltroArea" className="form-label fw-semibold">
            Filtrar por Área de Projeto
          </label>
          <select
            id="selectFiltroArea"
            className="form-select"
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
          >
            <option value="">Todas as áreas</option>
            {dadosAreasProjeto.map((area) => (
              <option key={area.id} value={area.id}>
                {area.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Título</th>
              <th>Área de Projeto</th>
              <th>Descrição</th>
              <th style={{ width: '140px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projetosFiltrados.length > 0 ? (
              projetosFiltrados.map((projeto) => (
                <tr key={projeto.id}>
                  <td className="fw-medium">{projeto.titulo}</td>
                  <td>
                    {projeto.nomeAreaProjeto ? (
                      <span className="badge bg-info text-dark">
                        {projeto.nomeAreaProjeto}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{projeto.descricao || '—'}</td>
                  <td>
                    <Stack spacing={0.5} direction="row">
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label="quadro kanban"
                        onClick={() => navigate(`/perfil-projeto/${projeto.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        aria-label="editar"
                        onClick={() => navigate(`/cadastro-projeto/${projeto.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="excluir"
                        onClick={() => abrirConfirmacao(projeto)}
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
                  Nenhum projeto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={openConfirmacao} onClose={fecharConfirmacao}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o projeto{' '}
            <strong>{projetoSelecionado?.titulo}</strong>? Essa ação não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharConfirmacao} color="inherit">
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

export default ListagemProjetos;