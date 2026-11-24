import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Card from "../components/card";
import FormGroup from "../components/form-group";
import { mensagemSucesso, mensagemErro } from "../components/toastr";
import "../custom.css";
import axios from "axios";
import { API_URLS } from "../config/axios";
import { toTitleCase } from "../utils/formatadores";

const baseURL = `${API_URLS}/autores`;

function CadastroAutor() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");

  async function buscar() {
    try {
      const response = await axios.get(`${baseURL}/${idParam}`);
      setId(response.data.id);
      setNome(toTitleCase(response.data.nome) || "");
    } catch {
      mensagemErro("Erro ao buscar autor.");
    }
  }

  useEffect(() => {
    if (idParam) buscar();
  }, [idParam]);

  async function salvar() {
    const data = { id, nome };
    const url = idParam ? `${baseURL}/${idParam}` : baseURL;

    try {
      await axios[idParam ? "put" : "post"](url, data, {
        headers: { "Content-Type": "application/json" }
      });

      mensagemSucesso(`Autor ${toTitleCase(nome)} salvo com sucesso!`);
      navigate("/listagem-autores");
    } catch (error) {
      mensagemErro(error.response?.data || "Erro ao salvar autor.");
    }
  }

  return (
    <div className="container">
      <Card title="Cadastro de Autor">
        <FormGroup label="Nome do Autor: *">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="form-control"
          />
        </FormGroup>

        <Stack spacing={1} direction="row">
          <button className="btn btn-success" onClick={salvar}>Salvar</button>
          <button className="btn btn-danger" onClick={() => navigate("/listagem-autores")}>Cancelar</button>
        </Stack>
      </Card>
    </div>
  );
}

export default CadastroAutor;