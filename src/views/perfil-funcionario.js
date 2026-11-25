import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';

import Card from '../components/card';
import { mensagemErro } from '../components/toastr';
import api from '../config/axios';
import { formatarLocalDate } from '../utils/formatters';

function PerfilFuncionario() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const [funcionario, setFuncionario] = useState(null);
  const [participacoes, setParticipacoes] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/funcionarios/${idParam}`),
      api.get(`/funcionarios-projeto/funcionario/${idParam}`),
    ])
      .then(([resFunc, resPart]) => {
        setFuncionario(resFunc.data);
        setParticipacoes(resPart.data);
      })
      .catch((error) => {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao carregar perfil do funcionário.'
        );
        setFuncionario(false);
        setParticipacoes([]);
      });
  }, [idParam]);

  if (!funcionario || !participacoes) return null;

  return (
    <Card
      title={
        funcionario.nome
          ? `Perfil — ${funcionario.nome}`
          : 'Perfil do Funcionário'
      }
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <button
          type="button"
          className="btn btn-warning text-white fw-semibold"
          onClick={() => navigate(`/cadastro-funcionario/${funcionario.id}`)}
        >
          Editar Funcionário
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/listagem-funcionarios')}
        >
          ← Voltar
        </button>
      </div>

      <div className="mb-3">
        <p>
          <strong>Nome:</strong> {funcionario.nome || '—'}
        </p>
        <p>
          <strong>E-mail:</strong> {funcionario.email || '—'}
        </p>
        <p>
          <strong>Cargo:</strong> {funcionario.nomeCargo || 'Sem cargo'}
        </p>
        <p>
          <strong>Data de Nascimento:</strong>{' '}
          {formatarLocalDate(funcionario.dataNascimento)}
        </p>
        <p>
          <strong>Telefone:</strong> {funcionario.telefone || '—'}
        </p>
        <p>
          <strong>Biografia:</strong> {funcionario.bio || '—'}
        </p>
      </div>

      <hr />
      <h5>Projetos em que Participa</h5>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Projeto</th>
              <th>Papel no Projeto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {participacoes.map((item) => (
              <tr key={item.id}>
                <td className="fw-medium">{item.tituloProjeto}</td>
                <td>
                  {item.ehResponsavel ? (
                    <span className="badge bg-success">Responsável</span>
                  ) : (
                    <span className="badge bg-secondary">Participante</span>
                  )}
                </td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/perfil-projeto/${item.idProjeto}`)}
                    >
                      Abrir Quadro
                    </button>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default PerfilFuncionario;