import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/axios';
import { mensagemSucesso, mensagemErro } from '../components/toastr';

const COR_PADRAO = '#3B82F6';

function CadastroPrioridade() {
  const navigate = useNavigate();
  const { idParam } = useParams();

  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(COR_PADRAO);

  useEffect(() => {
    if (idParam) {
      api
        .get(`/prioridades/${idParam}`)
        .then((response) => {
          setNome(response.data.nome || '');
          setCor(response.data.cor || COR_PADRAO);
        })
        .catch((error) => {
          mensagemErro(error.response?.data || 'Erro ao carregar prioridade.');
        });
    }
  }, [idParam]);

  const handleColorPickerChange = (e) => {
    setCor(e.target.value.toUpperCase());
  };

  const handleHexInputChange = (e) => {
    const valor = e.target.value.toUpperCase();
    setCor(valor);
  };

  const salvar = (e) => {
    e.preventDefault();

    const payload = {
      nome,
      cor: cor && cor.trim() !== '' ? cor.trim().toUpperCase() : COR_PADRAO,
    };

    const requisicao = idParam
      ? api.put(`/prioridades/${idParam}`, payload)
      : api.post('/prioridades', payload);

    requisicao
      .then(() => {
        mensagemSucesso(
          idParam
            ? 'Prioridade atualizada com sucesso!'
            : 'Prioridade cadastrada com sucesso!'
        );
        navigate('/listagem-prioridades');
      })
      .catch((error) => {
        mensagemErro(error.response?.data || 'Erro ao salvar prioridade.');
      });
  };

  const corPreview = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cor.trim())
    ? cor.trim()
    : COR_PADRAO;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h4>{idParam ? 'Editar Prioridade' : 'Cadastro de Prioridade'}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={salvar}>
            <div className="mb-3">
              <label htmlFor="inputNome" className="form-label">
                Nome *
              </label>
              <input
                id="inputNome"
                type="text"
                className="form-control"
                maxLength={60}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Alta, Média, Baixa"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="inputCorHex" className="form-label">
                Cor (Hexadecimal)
              </label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={corPreview}
                  onChange={handleColorPickerChange}
                  title="Escolher cor"
                  style={{ width: '56px', height: '38px', padding: '2px' }}
                />
                <input
                  id="inputCorHex"
                  type="text"
                  className="form-control"
                  maxLength={7}
                  value={cor}
                  onChange={handleHexInputChange}
                  placeholder="#3B82F6"
                  style={{ maxWidth: '160px' }}
                />
                <span
                  className="badge"
                  style={{
                    backgroundColor: corPreview,
                    color: '#FFFFFF',
                    padding: '8px 12px',
                  }}
                >
                  {nome.trim() || 'Prévia'}
                </span>
              </div>
              <small className="form-text text-muted">
                Formato #RGB ou #RRGGBB. Se deixado em branco, assume #3B82F6.
              </small>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success">
                Salvar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/listagem-prioridades')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastroPrioridade;