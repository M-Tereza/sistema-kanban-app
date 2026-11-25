import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../config/axios';
import { mensagemSucesso, mensagemErro } from '../components/toastr';

function CadastroTarefa() {
  const navigate = useNavigate();
  const { idParam } = useParams();
  const [searchParams] = useSearchParams();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataLimite, setDataLimite] = useState('');
  const [idProjeto, setIdProjeto] = useState(searchParams.get('idProjeto') || '');
  const [idFase, setIdFase] = useState(searchParams.get('idFase') || '');
  const [idPrioridade, setIdPrioridade] = useState('');

  const [projetos, setProjetos] = useState([]);
  const [fases, setFases] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  useEffect(() => {
    api
      .get('/projetos')
      .then((res) => setProjetos(res.data || []))
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao carregar projetos.')
      );

    api
      .get('/prioridades')
      .then((res) => setPrioridades(res.data || []))
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao carregar prioridades.')
      );
  }, []);

  useEffect(() => {
    if (!idProjeto) {
      setFases([]);
      return;
    }
    api
      .get(`/fases/projeto/${idProjeto}`)
      .then((res) => setFases(res.data || []))
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao carregar fases do projeto.')
      );
  }, [idProjeto]);

  useEffect(() => {
    if (!idParam) return;
    api
      .get(`/tarefas/${idParam}`)
      .then((res) => {
        const t = res.data;
        setTitulo(t.titulo || '');
        setDescricao(t.descricao || '');
        setIdProjeto(t.idProjeto ? String(t.idProjeto) : '');
        setIdFase(t.idFase ? String(t.idFase) : '');
        setIdPrioridade(t.idPrioridade ? String(t.idPrioridade) : '');
        if (t.dataLimite) {
          setDataLimite(t.dataLimite.slice(0, 16));
        }
      })
      .catch((err) =>
        mensagemErro(err.response?.data || 'Erro ao carregar tarefa.')
      );
  }, [idParam]);

  const salvar = (e) => {
    e.preventDefault();

    const payload = {
      titulo,
      descricao: descricao.trim() ? descricao : null,
      dataLimite: dataLimite ? new Date(dataLimite).toISOString() : null,
      idFase: idFase ? Number(idFase) : null,
      idPrioridade: idPrioridade ? Number(idPrioridade) : null,
    };

    const req = idParam
      ? api.put(`/tarefas/${idParam}`, payload)
      : api.post('/tarefas', payload);

    req
      .then((res) => {
        mensagemSucesso(
          idParam
            ? 'Tarefa atualizada com sucesso!'
            : 'Tarefa cadastrada com sucesso!'
        );
        const tarefaId = res.data?.id || idParam;
        if (tarefaId) {
          navigate(`/perfil-tarefa/${tarefaId}`);
        } else if (idProjeto) {
          navigate(`/perfil-projeto/${idProjeto}`);
        } else {
          navigate('/listagem-projetos');
        }
      })
      .catch((err) => {
        mensagemErro(err.response?.data || 'Erro ao salvar tarefa.');
      });
  };

  const prioridadeSelecionada = prioridades.find(
    (p) => String(p.id) === String(idPrioridade)
  );

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h4>{idParam ? 'Editar Tarefa' : 'Cadastro de Tarefa'}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={salvar}>
            <div className="mb-3">
              <label htmlFor="selectProjetoTarefa" className="form-label">
                Projeto *
              </label>
              <select
                id="selectProjetoTarefa"
                className="form-select"
                value={idProjeto}
                onChange={(e) => {
                  setIdProjeto(e.target.value);
                  setIdFase('');
                }}
              >
                <option value="">Selecione um projeto...</option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="selectFaseTarefa" className="form-label">
                Fase *
              </label>
              <select
                id="selectFaseTarefa"
                className="form-select"
                value={idFase}
                onChange={(e) => setIdFase(e.target.value)}
                disabled={!idProjeto}
              >
                <option value="">Selecione uma fase...</option>
                {fases.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="inputTituloTarefa" className="form-label">
                Título *
              </label>
              <input
                id="inputTituloTarefa"
                type="text"
                className="form-control"
                maxLength={120}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Implementar autenticação e rotas"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="inputDescricaoTarefa" className="form-label">
                Descrição
              </label>
              <textarea
                id="inputDescricaoTarefa"
                className="form-control"
                rows={3}
                maxLength={500}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes da tarefa (opcional)"
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="selectPrioridadeTarefa" className="form-label">
                  Prioridade
                </label>
                <div className="d-flex align-items-center gap-2">
                  <select
                    id="selectPrioridadeTarefa"
                    className="form-select"
                    value={idPrioridade}
                    onChange={(e) => setIdPrioridade(e.target.value)}
                  >
                    <option value="">Sem prioridade</option>
                    {prioridades.map((prio) => (
                      <option key={prio.id} value={prio.id}>
                        {prio.nome} ({prio.cor || '#3B82F6'})
                      </option>
                    ))}
                  </select>
                  {prioridadeSelecionada && (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: prioridadeSelecionada.cor || '#3B82F6',
                        color: '#FFFFFF',
                        padding: '8px 10px',
                      }}
                    >
                      {prioridadeSelecionada.nome}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <label htmlFor="inputDataLimiteTarefa" className="form-label">
                  Data Limite
                </label>
                <input
                  id="inputDataLimiteTarefa"
                  type="datetime-local"
                  className="form-control"
                  value={dataLimite}
                  onChange={(e) => setDataLimite(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success">
                Salvar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
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

export default CadastroTarefa;