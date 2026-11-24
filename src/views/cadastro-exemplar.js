import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Card from "../components/card";
import FormGroup from "../components/form-group";
import { mensagemSucesso, mensagemErro } from "../components/toastr";
import "../custom.css";
import axios from "axios";
import { API_URLS } from "../config/axios";
import { toTitleCase } from "../utils/formatadores";

const baseURL = `${API_URLS}/exemplares`;
const secoesURL = `${API_URLS}/secoes`;
const statusURL = `${API_URLS}/statusExemplares`;

function CadastroExemplar() {

  const { idParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const idObraQuery = searchParams.get("idObra");

  const [idObra, setIdObra] = useState(idObraQuery || "");
  const [tombo, setTombo] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [dataAquisicao, setDataAquisicao] = useState("");
  const [idStatusExemplar, setIdStatusExemplar] = useState("");
  const [idSecao, setIdSecao] = useState("");
  const [dados, setDados] = useState(null);
  const [secoes, setSecoes] = useState([]);
  const [status, setStatus] = useState([]);

  const voltar = () => {
    if (idObra) navigate(`/perfil-obra/${idObra}`);
    else navigate(-1);
  };

  async function salvar() {

    if (!tombo || tombo.trim() === "")
      return mensagemErro("O tombo é obrigatório.");

    if (!codigoBarras || codigoBarras.trim() === "")
      return mensagemErro("O código de barras é obrigatório.");

    if (idParam && !idStatusExemplar)
      return mensagemErro("O status é obrigatório.");

    const data = JSON.stringify({
      tombo,
      codigoBarras,
      dataAquisicao: dataAquisicao || null,
      idObra,
      idStatusExemplar: idParam ? idStatusExemplar : null,
      idSecao: idSecao || null
    });

    try {

      if (idParam == null) {

        await axios.post(baseURL, data, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        mensagemSucesso("Exemplar cadastrado com sucesso!");

      } else {

        await axios.put(`${baseURL}/${idParam}`, data, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        mensagemSucesso("Exemplar alterado com sucesso!");

      }

      navigate(`/perfil-obra/${idObra}`);

    } catch (error) {

      mensagemErro(error.response?.data || "Erro ao salvar exemplar.");

    }

  }

  async function buscar() {

    if (!idParam) return;

    try {

      const response = await axios.get(`${baseURL}/${idParam}`);

      setDados(response.data);
      setIdObra(response.data.idObra);
      setTombo(response.data.tombo || "");
      setCodigoBarras(response.data.codigoBarras || "");
      setDataAquisicao(response.data.dataAquisicao || "");
      setIdStatusExemplar(response.data.idStatusExemplar || "");
      setIdSecao(response.data.idSecao || "");

    } catch {

      mensagemErro("Erro ao buscar exemplar.");

    }

  }

  useEffect(() => {

    buscar();

    axios.get(secoesURL)
      .then(res => setSecoes(res.data))
      .catch(() => mensagemErro("Erro ao carregar seções"));

    axios.get(statusURL)
      .then(res => setStatus(res.data))
      .catch(() => mensagemErro("Erro ao carregar status"));

  }, [idParam]);

  if (!dados && idParam) return <p>Carregando...</p>;

  return (
    <div className="container">
      <Card title={idParam ? "Alteração de Exemplar" : "Cadastro de Exemplar"}>
        <div className="row">
          <div className="col-lg-12">
            <div className="bs-component">

              <FormGroup label="Tombo: *" htmlFor="inputTombo">
                <TextField
                  id="inputTombo"
                  fullWidth
                  size="small"
                  value={tombo}
                  onChange={(e) => setTombo(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Código de Barras: *" htmlFor="inputCodigo">
                <TextField
                  id="inputCodigo"
                  fullWidth
                  size="small"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Data de Aquisição:" htmlFor="inputData">
                <TextField
                  id="inputData"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={dataAquisicao}
                  onChange={(e) => setDataAquisicao(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Seção:" htmlFor="selectSecao">
                <select
                  id="selectSecao"
                  className="form-control"
                  value={idSecao}
                  onChange={(e) => setIdSecao(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {secoes.map(secao => (
                    <option
                      key={secao.id}
                      value={secao.id}
                    >
                      {toTitleCase(secao.nome)}
                    </option>
                  ))}
                </select>
              </FormGroup>

              {idParam && (
                <FormGroup label="Status: *" htmlFor="selectStatus">
                  <select
                    id="selectStatus"
                    className="form-control"
                    value={idStatusExemplar}
                    onChange={(e) => setIdStatusExemplar(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {status.map(s => (
                      <option
                        key={s.id}
                        value={s.id}
                      >
                        {toTitleCase(s.nome)}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              )}

              <Stack
                spacing={1}
                padding={1}
                direction="row"
              >
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={salvar}
                >
                  Salvar
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={voltar}
                >
                  Cancelar
                </button>
              </Stack>

            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CadastroExemplar;