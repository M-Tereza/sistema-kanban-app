import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Card from "../components/card";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBack";
import { mensagemErro } from "../components/toastr";
import { API_URLS } from "../config/axios";
import { toTitleCase } from "../utils/formatadores";

const OBRAS_URL = `${API_URLS}/obras`;
const EXEMPLARES_URL = `${API_URLS}/exemplares`;

function SelecionarObra() {
  const navigate = useNavigate();
  const location = useLocation();
  const { idCliente } = useParams();

  const [obras, setObras] = useState([]);
  const [exemplares, setExemplares] = useState([]);

  const tipo = new URLSearchParams(location.search).get("tipo");

  useEffect(() => {
    async function carregar() {
      try {
        const [obrasRes, exemplaresRes] = await Promise.all([
          axios.get(OBRAS_URL),
          axios.get(EXEMPLARES_URL),
        ]);

        setObras(obrasRes.data);
        setExemplares(exemplaresRes.data);
      } catch {
        mensagemErro("Erro ao carregar obras.");
      }
    }

    carregar();
  }, []);

  const voltar = () => navigate(`/perfil-cliente/${idCliente}`);

  const selecionarObra = (obra) => {
    if (tipo === "reserva") {
      navigate(`/confirmar-reserva/${idCliente}/${obra.id}`);
      return;
    }

    navigate(`/selecionar-exemplar/${idCliente}/${obra.id}`);
  };

  const obterTombos = (idObra) => {
    const tombos = exemplares
      .filter((e) => Number(e.idObra) === Number(idObra))
      .map((e) => e.tombo);

    return tombos.length > 0
      ? tombos.join(", ")
      : "Nenhum exemplar";
  };

  return (
    <div className="container">
      <Card
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={voltar}>
              <ArrowBackIosIcon />
            </IconButton>
            <span>
              {tipo === "reserva"
                ? "Selecionar Obra para Reserva"
                : "Selecionar Obra"}
            </span>
          </Stack>
        }
      >
        {obras.length === 0 ? (
          <p>Nenhuma obra encontrada.</p>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autores</th>
                <th>Tombos</th>
                <th>Edição</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {obras.map((obra) => (
                <tr key={obra.id}>
                  <td>{toTitleCase(obra.titulo)}</td>

                  <td>
                    {obra.autores?.length
                      ? obra.autores.map(toTitleCase).join(", ")
                      : "Não informado"}
                  </td>

                  <td>{obterTombos(obra.id)}</td>

                  <td>{obra.edicao}</td>

                  <td>
                    <Button
                      variant="contained"
                      onClick={() => selecionarObra(obra)}
                    >
                      Selecionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default SelecionarObra;