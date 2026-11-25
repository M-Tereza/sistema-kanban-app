import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { mensagemSucesso, mensagemErro } from '../components/toastr';

function ListagemPrioridades() {
  const navigate = useNavigate();
  const [prioridades, setPrioridades] = useState(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api
      .get('/prioridades')
      .then((response) => {
        setPrioridades(response.data || []);
      })
      .catch((error) => {
        mensagemErro(error.response?.data || 'Erro ao carregar prioridades.');
        setPrioridades([]);
      });
  }, []);

  if (!prioridades) return null;

  const excluir = (id) => {
    api
      .delete(`/prioridades/${id}`)
      .then(() => {
        setPrioridades((prev) => prev.filter((item) => item.id !== id));
        mensagemSucesso('Prioridade excluída com sucesso!');
      })
      .catch((error) => {
        mensagemErro(error.response?.data || 'Erro ao excluir prioridade.');
      });
  };

  const filtradas = prioridades.filter((p) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    return (
      (p.nome && p.nome.toLowerCase().includes(termo)) ||
      (p.cor && p.cor.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Prioridades</h3>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/cadastro-prioridade')}
        >
          Nova Prioridade
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nome ou cor hexadecimal..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cor</th>
              <th style={{ width: '180px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center text-muted">
                  Nenhuma prioridade encontrada.
                </td>
              </tr>
            ) : (
              filtradas.map((prioridade) => {
                const corBadge = prioridade.cor || '#3B82F6';
                return (
                  <tr key={prioridade.id}>
                    <td>{prioridade.nome}</td>
                    <td>
                      <span
                        className="badge me-2"
                        style={{
                          backgroundColor: corBadge,
                          color: '#FFFFFF',
                        }}
                      >
                        {prioridade.nome}
                      </span>
                      <code>{corBadge}</code>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-warning me-2"
                        onClick={() =>
                          navigate(`/cadastro-prioridade/${prioridade.id}`)
                        }
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => excluir(prioridade.id)}
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

export default ListagemPrioridades;