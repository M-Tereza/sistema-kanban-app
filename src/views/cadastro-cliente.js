import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';
import axios from 'axios';
import { API_URLS } from "../config/axios";

const formatCPF = (value) => {
  if (!value) return '';
  const cpf = value.replace(/\D/g, '');
  return cpf.padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatTelefone = (value) => {
  if (!value) return '';
  const tel = value.replace(/\D/g, '');
  if (tel.length === 10) return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  if (tel.length === 11) return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  return value;
};

const formatCEP = (value) => {
  if (!value) return '';
  const cep = value.replace(/\D/g, '');
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const baseURL = `${API_URLS}/clientes`;

function CadastroCliente() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);

  const [id, setId] = useState(null);
  const [nome, setNome] = useState(null);
  const [cpf, setCpf] = useState(null);
  const [dataNascimento, setDataNascimento] = useState(null);
  const [email, setEmail] = useState(null);
  const [telefone, setTelefone] = useState(null);
  const [cep, setCep] = useState(null);
  const [logradouro, setLogradouro] = useState(null);
  const [numero, setNumero] = useState(null);
  const [complemento, setComplemento] = useState(null);
  const [bairro, setBairro] = useState(null);
  const [cidade, setCidade] = useState(null);
  const [estado, setEstado] = useState(null);

  function inicializar() {
    if (idParam == null) {
      setId('');
      setNome('');
      setCpf('');
      setDataNascimento('');
      setEmail('');
      setTelefone('');
      setCep('');
      setLogradouro('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCidade('');
      setEstado('');
    } else {
      setId(dados.id);
      setNome(dados.nome);
      setCpf(formatCPF(dados.cpf));
      setTelefone(formatTelefone(dados.telefone));
      setCep(formatCEP(dados.cep));
      setDataNascimento(dados.dataNascimento);
      setEmail(dados.email);
      setLogradouro(dados.logradouro);
      setNumero(dados.numero);
      setComplemento(dados.complemento);
      setBairro(dados.bairro);
      setCidade(dados.cidade);
      setEstado(dados.estado);
    }
  }

  const voltar = () => {
    if (idParam == null) navigate('/listagem-clientes');
    else navigate(`/perfil-cliente/${idParam}`);
  };

  async function salvar() {
    if (!nome || nome.trim() === '') return mensagemErro('O nome é obrigatório.');
    if (!cpf || cpf.trim() === '') return mensagemErro('O CPF é obrigatório.');

    const cpfNumerico = cpf.replace(/\D/g, '');
    if (!/^\d{11}$/.test(cpfNumerico)) return mensagemErro('Digite um CPF válido.');

    if (email && email.trim() !== '') {
      if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+(\.[A-Za-z]{2,})+$/.test(email)) {
        return mensagemErro('E-mail inválido.');
      }
    }

    let telefoneFormatado = telefone;
    if (telefone && telefone.trim() !== '') {
      const telefoneNumerico = telefone.replace(/\D/g, '');
      if (telefoneNumerico.length !== 10 && telefoneNumerico.length !== 11) {
        return mensagemErro('Telefone inválido.');
      }
      telefoneFormatado =
        telefoneNumerico.length === 10
          ? `(${telefoneNumerico.substring(0, 2)}) ${telefoneNumerico.substring(2, 6)}-${telefoneNumerico.substring(6)}`
          : `(${telefoneNumerico.substring(0, 2)}) ${telefoneNumerico.substring(2, 7)}-${telefoneNumerico.substring(7)}`;
    }

    let cepFormatado = cep;
    if (cep && cep.trim() !== '') {
      const cepNumerico = cep.replace(/\D/g, '');
      if (cepNumerico.length !== 8) return mensagemErro('Digite um CEP válido.');
      cepFormatado = `${cepNumerico.substring(0, 5)}-${cepNumerico.substring(5)}`;
    }

    const data = {
      id,
      nome,
      cpf: cpfNumerico,
      dataNascimento,
      email,
      telefone: telefoneFormatado,
      cep: cepFormatado,
      logradouro,
      numero: numero === '' ? null : numero,
      complemento,
      bairro,
      cidade,
      estado
    };

    try {
      if (!idParam) {
        await axios.post(baseURL, data, { headers: { 'Content-Type': 'application/json' } });
        mensagemSucesso(`Cliente ${nome} cadastrado com sucesso!`);
      } else {
        await axios.put(`${baseURL}/${idParam}`, data, { headers: { 'Content-Type': 'application/json' } });
        mensagemSucesso(`Cliente ${nome} alterado com sucesso!`);
      }
      navigate('/listagem-clientes');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao salvar cliente.');
    }
  }

  async function buscar() {
    try {
      const response = await axios.get(`${baseURL}/${idParam}`);
      const cliente = response.data;

      setDados(cliente);
      setId(cliente.id);
      setNome(cliente.nome);
      setCpf(formatCPF(cliente.cpf));
      setTelefone(formatTelefone(cliente.telefone));
      setCep(formatCEP(cliente.cep));
      setDataNascimento(cliente.dataNascimento);
      setEmail(cliente.email);
      setLogradouro(cliente.logradouro);
      setNumero(cliente.numero);
      setComplemento(cliente.complemento);
      setBairro(cliente.bairro);
      setCidade(cliente.cidade);
      setEstado(cliente.estado);
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao buscar cliente.');
    }
  }

  useEffect(() => {
    if (idParam) buscar();
  }, []);

  return (
    <div className="container">
      <Card title={idParam ? 'Alteração de Cliente' : 'Cadastro de Cliente'}>
        <div className="row">
          <div className="col-lg-12">
            <div className="bs-component">

              <FormGroup label="Nome: *" htmlFor="inputNome">
                <input id="inputNome" value={nome || ''} className="form-control" onChange={(e) => setNome(e.target.value)} />
              </FormGroup>

              <FormGroup label="CPF: *" htmlFor="inputCpf">
                <input id="inputCpf" value={cpf || ''} className="form-control" maxLength="14" onChange={(e) => setCpf(e.target.value)} />
              </FormGroup>

              <FormGroup label="Data de Nascimento:" htmlFor="inputDtNascimento">
                <input type="date" id="inputDtNascimento" value={dataNascimento || ''} className="form-control" onChange={(e) => setDataNascimento(e.target.value)} />
              </FormGroup>

              <FormGroup label="Email:" htmlFor="inputEmail">
                <input type="email" id="inputEmail" value={email || ''} className="form-control" onChange={(e) => setEmail(e.target.value)} />
              </FormGroup>

              <FormGroup label="Telefone:" htmlFor="inputTelefone">
                <input id="inputTelefone" value={telefone || ''} className="form-control" onChange={(e) => setTelefone(e.target.value)} />
              </FormGroup>

              <FormGroup label="CEP:" htmlFor="inputCep">
                <input id="inputCep" value={cep || ''} className="form-control" onChange={(e) => setCep(e.target.value)} />
              </FormGroup>

              <FormGroup label="Logradouro:" htmlFor="inputLogradouro">
                <input id="inputLogradouro" value={logradouro || ''} className="form-control" onChange={(e) => setLogradouro(e.target.value)} />
              </FormGroup>

              <FormGroup label="Número:" htmlFor="inputNumero">
                <input type="number" id="inputNumero" value={numero || ''} className="form-control" onChange={(e) => setNumero(e.target.value)} />
              </FormGroup>

              <FormGroup label="Complemento:" htmlFor="inputComplemento">
                <input id="inputComplemento" value={complemento || ''} className="form-control" onChange={(e) => setComplemento(e.target.value)} />
              </FormGroup>

              <FormGroup label="Bairro:" htmlFor="inputBairro">
                <input id="inputBairro" value={bairro || ''} className="form-control" onChange={(e) => setBairro(e.target.value)} />
              </FormGroup>

              <FormGroup label="Cidade:" htmlFor="inputCidade">
                <input id="inputCidade" value={cidade || ''} className="form-control" onChange={(e) => setCidade(e.target.value)} />
              </FormGroup>

              <FormGroup label="Estado:" htmlFor="inputEstado">
                <input id="inputEstado" value={estado || ''} className="form-control" onChange={(e) => setEstado(e.target.value)} />
              </FormGroup>

              <Stack spacing={1} padding={1} direction="row">
                <button onClick={salvar} type="button" className="btn btn-success">Salvar</button>
                <button onClick={voltar} type="button" className="btn btn-danger">Cancelar</button>
              </Stack>

            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CadastroCliente;