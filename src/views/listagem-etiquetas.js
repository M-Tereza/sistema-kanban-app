import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { mensagemSucesso, mensagemErro } from '../components/toastr';

function ListagemEtiquetas() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState(null);
  const [projetoSelecionado, setProjetoSelecionado] = useState('');
  const [etiquetas, setEtiquetas] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api
      .get('/projetos')
      .then((response) => {
        const listaProjetos = response.data || [];
        setProjetos(listaProjetos);
        if (listaProjetos.length > 0) {
          setProjetoSelecionado(String(listaProjetos[0].id));
        }
      })
      .catch((error) => {
        mensagemErro(error.response?.data || 'Erro ao carregar projetos.');
        setProjetos([]);
      });
  }, []);

  useEffect(() => {
    if (!projetoSelecionado) {
      setEtiquetas([]);
      return;
    }
    api
      .get(`/etiquetas/projeto/${projetoSelecionado}`)
      .then((response) => {
        setEtiquetas(response.data || []);
      })
      .catch((error) => {
        mensagemErro(error.response?.data || 'Erro ao carregar etiquetas.');
        setEtiquetas([]);
      });
  }, [projetoSelecionado]);

  if (!projetos) return null;

  const excluir = (id) => {
    api
      .delete(`/etiquetas/${id}`)
      .then(() => {
        setEtiquetas((prev) => prev.filter((item) => item.id !== id));
        mensagemSucesso('Etiqueta excluída com sucesso!');
      })
      .catch((error) => {
        mensagemErro(error.response?.data || 'Erro ao excluir etiqueta.');
      });
  };

  const filtradas = etiquetas.filter((etiqueta) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    return (
      (etiqueta.nome && etiqueta.nome.toLowerCase().includes(termo)) ||
      (etiqueta.cor && etiqueta.cor.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Etiquetas</h3>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate(
              projetoSelecionado
                ? `/cadastro-etiqueta?idProjeto=${projetoSelecionado}`
                : '/cadastro-etiqueta'
            )
          }
        >
          Nova Etiqueta
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-5">
          <select
            className="form-select"
            value={projetoSelecionado}
            onChange={(e) => setProjetoSelecionado(e.target.value)}
          >
            <option value="">Selecione um projeto...</option>
            {projetos.map((projeto) => (
              <option key={projeto.id} value={projeto.id}>
                {projeto.titulo}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar etiqueta por nome ou cor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cor</th>
              <th>Projeto</th>
              <th style={{ width: '180px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  Nenhuma etiqueta encontrada.
                </td>
              </tr>
            ) : (
              filtradas.map((etiqueta) => {
                const corBadge = etiqueta.cor || '#3B82F6';
                return (
                  <tr key={etiqueta.id}>
                    <td>{etiqueta.nome}</td>
                    <td>
                      <span
                        className="badge me-2"
                        style={{
                          backgroundColor: corBadge,
                          color: '#FFFFFF',
                        }}
                      >
                        {etiqueta.nome}
                      </span>
                      <code>{corBadge}</code>
                    </td>
                    <td>{etiqueta.tituloProjeto}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-warning me-2"
                        onClick={() =>
                          navigate(`/cadastro-etiqueta/${etiqueta.id}`)
                        }
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => excluir(etiqueta.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListagemEtiquetas;