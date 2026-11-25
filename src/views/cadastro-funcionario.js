import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import api from '../config/axios';

function CadastroFuncionario() {
  const { idParam } = useParams();
  const navigate = useNavigate();
  const endpoint = '/funcionarios';

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bio, setBio] = useState('');
  const [idCargo, setIdCargo] = useState('');
  const [dadosCargos, setDadosCargos] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    api
      .get('/cargos')
      .then((response) => setDadosCargos(response.data))
      .catch(() => setDadosCargos([]));
  }, []);

  useEffect(() => {
    async function buscar() {
      if (idParam == null) {
        setCarregado(true);
        return;
      }
      try {
        const response = await api.get(`${endpoint}/${idParam}`);
        const func = response.data;
        setId(func.id);
        setNome(func.nome || '');
        setEmail(func.email || '');
        setDataNascimento(func.dataNascimento || '');
        setTelefone(func.telefone || '');
        setBio(func.bio || '');
        setIdCargo(func.idCargo != null ? String(func.idCargo) : '');
      } catch (error) {
        mensagemErro(
          error.response && error.response.data
            ? String(error.response.data)
            : 'Erro ao carregar funcionário.'
        );
      } finally {
        setCarregado(true);
      }
    }

    setCarregado(false);
    buscar();
  }, [idParam]);

  async function salvar() {
    if (!nome || !nome.trim()) {
      mensagemErro('O nome do funcionário é obrigatório.');
      return;
    }

    if (!email || !email.trim()) {
      mensagemErro('O e-mail do funcionário é obrigatório.');
      return;
    }

    const payload = {
      id: id || undefined,
      nome: nome.trim(),
      email: email.trim(),
      dataNascimento: dataNascimento || null,
      telefone: telefone && telefone.trim() ? telefone.trim() : null,
      bio: bio && bio.trim() ? bio.trim() : null,
      idCargo: idCargo ? Number(idCargo) : null,
    };

    try {
      if (idParam == null) {
        await api.post(endpoint, payload);
        mensagemSucesso('Funcionário cadastrado com sucesso!');
      } else {
        await api.put(`${endpoint}/${idParam}`, payload);
        mensagemSucesso('Funcionário atualizado com sucesso!');
      }
      navigate('/listagem-funcionarios');
    } catch (error) {
      mensagemErro(
        error.response && error.response.data
          ? String(error.response.data)
          : 'Erro ao salvar funcionário.'
      );
    }
  }

  if (!carregado || !dadosCargos) return null;

  return (
    <Card
      title={
        idParam == null ? 'Cadastro de Funcionário' : 'Edição de Funcionário'
      }
    >
      <FormGroup label="Nome *" htmlFor="inputNome">
        <input
          type="text"
          id="inputNome"
          maxLength={120}
          className="form-control"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="E-mail *" htmlFor="inputEmail">
        <input
          type="email"
          id="inputEmail"
          maxLength={150}
          className="form-control"
          placeholder="nome@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Cargo" htmlFor="selectCargo">
        <select
          id="selectCargo"
          className="form-select"
          value={idCargo}
          onChange={(e) => setIdCargo(e.target.value)}
        >
          <option value="">Sem cargo</option>
          {dadosCargos.map((cargo) => (
            <option key={cargo.id} value={cargo.id}>
              {cargo.nome}
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Data de Nascimento" htmlFor="inputDataNascimento">
        <input
          type="date"
          id="inputDataNascimento"
          className="form-control"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Telefone" htmlFor="inputTelefone">
        <input
          type="text"
          id="inputTelefone"
          maxLength={20}
          className="form-control"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Biografia" htmlFor="inputBio">
        <textarea
          id="inputBio"
          maxLength={300}
          rows={3}
          className="form-control"
          placeholder="Resumo profissional..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </FormGroup>

      <br />
      <Stack spacing={1} padding={1} direction="row">
        <button type="button" className="btn btn-success" onClick={salvar}>
          Salvar
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/listagem-funcionarios')}
        >
          Cancelar
        </button>
      </Stack>
    </Card>
  );
}

export default CadastroFuncionario;