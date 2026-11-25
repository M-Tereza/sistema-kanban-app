import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import { useDebounce } from '../utils/useDebounce';

import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

const baseURL = `${BASE_URL}/funcionarios`;

function ListagemFuncionarios() {
  const navigate = useNavigate();

  const [dados, setDados] = useState(null);
  const [dadosCargos, setDadosCargos] = useState(null);
  const [dadosProjetos, setDadosProjetos] = useState(null);
  const [vinculosPorFuncionario, setVinculosPorFuncionario] = useState(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [legendaAberta, setLegendaAberta] = useState(false);

  const termoBuscaDebounced = useDebounce(termoBusca, 300);

  const cadastrar = () => {
    navigate(`/cadastro-funcionario`);
  };

  const editar = (id) => {
    navigate(`/cadastro-funcionario/${id}`);
  };

  const visualizarPerfil = (id) => {
    navigate(`/perfil-funcionario/${id}`);
  };

  async function excluir() {
    if (!funcionarioSelecionado) return;
    const id = funcionarioSelecionado.id;
    let url = `${baseURL}/${id}`;
    await axios
      .delete(url)
      .then(function () {
        mensagemSucesso(`Funcionário excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
        setFuncionarioSelecionado(null);
      })
      .catch(function (error) {
        mensagemErro(
          error?.response?.data || `Erro ao excluir o funcionário`
        );
        setFuncionarioSelecionado(null);
      });
  }

  useEffect(() => {
    axios.get(`${BASE_URL}/cargos`).then((response) => {
      setDadosCargos(response.data);
    });

    axios.get(`${BASE_URL}/projetos`).then((response) => {
      setDadosProjetos(response.data);
    });

    axios.get(baseURL).then(async (response) => {
      const listaFuncionarios = response.data || [];
      setDados(listaFuncionarios);

      const resultadosVinculos = await Promise.all(
        listaFuncionarios.map((func) =>
          axios
            .get(`${BASE_URL}/funcionarios-projeto/funcionario/${func.id}`)
            .then((res) => ({
              funcionarioId: func.id,
              vinculos: res.data || [],
            }))
            .catch(() => ({
              funcionarioId: func.id,
              vinculos: [],
            }))
        )
      );

      const mapaVinculos = {};
      resultadosVinculos.forEach((item) => {
        mapaVinculos[item.funcionarioId] = item.vinculos;
      });
      setVinculosPorFuncionario(mapaVinculos);
    });
  }, []);

  if (!dados || !dadosCargos || !dadosProjetos || !vinculosPorFuncionario) {
    return null;
  }

  const normalizarTexto = (texto) =>
    (texto || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const apenasDigitos = (texto) => (texto || '').toString().replace(/\D/g, '');

  const limparFiltros = () => {
    setTermoBusca('');
    setFiltroCargo('');
    setFiltroProjeto('');
  };

  const funcionariosFiltrados = dados.filter((dado) => {
    const vinculos = vinculosPorFuncionario[dado.id] || [];

    if (filtroCargo !== '' && String(dado.idCargo || '') !== String(filtroCargo)) {
      return false;
    }

    if (filtroProjeto !== '') {
      const participaNoProjeto = vinculos.some(
        (v) => String(v.idProjeto) === String(filtroProjeto)
      );
      if (!participaNoProjeto) {
        return false;
      }
    }

    if (termoBuscaDebounced.trim() !== '') {
      const buscaNorm = normalizarTexto(termoBuscaDebounced.trim());
      const buscaDigitos = apenasDigitos(termoBuscaDebounced);

      const bateNome = normalizarTexto(dado.nome).includes(buscaNorm);
      const bateEmail = normalizarTexto(dado.email).includes(buscaNorm);
      const bateTelefoneTexto = normalizarTexto(dado.telefone).includes(buscaNorm);
      const bateTelefoneDigitos =
        buscaDigitos.length > 0 &&
        apenasDigitos(dado.telefone).includes(buscaDigitos);

      if (!bateNome && !bateEmail && !bateTelefoneTexto && !bateTelefoneDigitos) {
        return false;
      }
    }

    return true;
  });

  const temFiltroAtivo =
    termoBusca.trim() !== '' || filtroCargo !== '' || filtroProjeto !== '';

  return (
    <div className='container'>
      <Card title='Listagem de Funcionários'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <button
                  type='button'
                  className='btn btn-warning fw-semibold'
                  onClick={cadastrar}
                >
                  Novo Funcionário
                </button>

                {temFiltroAtivo && (
                  <button
                    type='button'
                    className='btn btn-outline-secondary btn-sm'
                    onClick={limparFiltros}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className='row g-2 mb-2'>
                <div className='col-md-5'>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Buscar por nome, e-mail ou telefone...'
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                  />
                </div>

                <div className='col-md-3'>
                  <select
                    className='form-select'
                    value={filtroCargo}
                    onChange={(e) => setFiltroCargo(e.target.value)}
                  >
                    <option value=''>Todos os cargos</option>
                    {dadosCargos.map((cargo) => (
                      <option key={cargo.id} value={cargo.id}>
                        {cargo.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='col-md-4'>
                  <select
                    className='form-select'
                    value={filtroProjeto}
                    onChange={(e) => setFiltroProjeto(e.target.value)}
                  >
                    <option value=''>Todos os projetos</option>
                    {dadosProjetos.map((projeto) => (
                      <option key={projeto.id} value={projeto.id}>
                        {projeto.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='mt-2 mb-3'>
                <button
                  type='button'
                  className='btn btn-link btn-sm p-0 text-decoration-none text-muted'
                  onClick={() => setLegendaAberta((prev) => !prev)}
                  aria-expanded={legendaAberta}
                >
                  {legendaAberta ? '▾ Ocultar legenda de projetos' : '▸ Ver legenda de projetos'}
                </button>

                {legendaAberta && (
                  <div className='mt-2 p-2 rounded bg-light border d-flex flex-wrap align-items-center gap-3 small text-muted'>
                    <span>
                      <span className='badge bg-primary me-1'>★ Projeto</span>
                      Responsável pelo projeto
                    </span>
                    <span>
                      <span className='badge bg-secondary me-1'>Projeto</span>
                      Membro participante
                    </span>
                  </div>
                )}
              </div>

              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col'>Nome</th>
                      <th scope='col'>E-mail</th>
                      <th scope='col'>Telefone</th>
                      <th scope='col'>Cargo</th>
                      <th scope='col'>Projetos</th>
                      <th scope='col'>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionariosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan='6' className='text-center text-muted py-3'>
                          Nenhum funcionário encontrado com os critérios informados.
                        </td>
                      </tr>
                    ) : (
                      funcionariosFiltrados.map((dado) => {
                        const vinculos = vinculosPorFuncionario[dado.id] || [];
                        const vinculosOrdenados = [...vinculos].sort(
                          (a, b) =>
                            Number(Boolean(b.ehResponsavel)) -
                            Number(Boolean(a.ehResponsavel))
                        );

                        return (
                          <tr key={dado.id}>
                            <td>{dado.nome}</td>
                            <td>{dado.email}</td>
                            <td>{dado.telefone || '-'}</td>
                            <td>{dado.nomeCargo || '-'}</td>
                            <td>
                              {vinculosOrdenados.length === 0 ? (
                                <span className='text-muted'>Nenhum</span>
                              ) : (
                                <div className='d-flex flex-wrap gap-1'>
                                  {vinculosOrdenados.map((vinculo) =>
                                    vinculo.ehResponsavel ? (
                                      <span
                                        key={vinculo.id}
                                        className='badge bg-primary'
                                        title='Responsável por este projeto'
                                      >
                                        ★ {vinculo.tituloProjeto}
                                      </span>
                                    ) : (
                                      <span
                                        key={vinculo.id}
                                        className='badge bg-secondary'
                                        title='Membro participante deste projeto'
                                      >
                                        {vinculo.tituloProjeto}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                            </td>
                            <td>
                              <Stack spacing={1} padding={0} direction='row'>
                                <IconButton
                                  aria-label='perfil'
                                  title='Visualizar perfil'
                                  onClick={() => visualizarPerfil(dado.id)}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  aria-label='edit'
                                  title='Editar funcionário'
                                  onClick={() => editar(dado.id)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  aria-label='delete'
                                  title='Excluir funcionário'
                                  onClick={() => setFuncionarioSelecionado(dado)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Stack>
                            </td>
                          </tr>
                        );
                      })
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

export default ListagemFuncionarios;