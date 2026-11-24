import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../components/card";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { mensagemErro, mensagemSucesso } from "../components/toastr";
import { API_URLS } from "../config/axios";
import { toTitleCase } from "../utils/formatadores";

const RESERVAS_URL = `${API_URLS}/reservas`;
const OBRAS_URL = `${API_URLS}/obras`;
const EXEMPLARES_URL = `${API_URLS}/exemplares`;

function ConfirmarReserva() {
  const navigate = useNavigate();
  const { idCliente, idObra } = useParams();

  const [obra, setObra] = useState(null);
  const [tombos, setTombos] = useState([]);
  const [possuiExemplarDisponivel, setPossuiExemplarDisponivel] =
    useState(false);

  const voltar = () =>
    navigate(`/selecionar-obra/${idCliente}?tipo=reserva`);

  useEffect(() => {
    async function carregar() {
      try {
        const { data: obraData } =
          await axios.get(`${OBRAS_URL}/${idObra}`);

        setObra(obraData);

        const { data: exemplares } =
          await axios.get(EXEMPLARES_URL);

        const exemplaresDaObra = exemplares.filter(
          (e) => Number(e.idObra) === Number(idObra)
        );

        const possuiDisponivel = exemplaresDaObra.some(
          (e) =>
            Number(e.idStatusExemplar) === 1 ||
            e.nomeStatusExemplar?.toLowerCase() === "disponível"
        );

        setPossuiExemplarDisponivel(
          possuiDisponivel
        );

        const tombosObra = exemplaresDaObra.map(
          (e) => ({
            tombo: e.tombo,
            status: e.nomeStatusExemplar,
          })
        );

        setTombos(tombosObra);

      } catch {
        mensagemErro(
          "Erro ao carregar informações da obra."
        );
      }
    }

    carregar();
  }, [idObra]);

  async function confirmar() {
    try {

      await axios.post(
        RESERVAS_URL,
        {
          idCliente: Number(idCliente),
          idObra: Number(idObra),
        }
      );

      mensagemSucesso(
        "Reserva realizada com sucesso!"
      );

      navigate(
        `/perfil-cliente/${idCliente}`
      );

    } catch (error) {

      mensagemErro(
        error?.response?.data ||
        "Erro ao realizar a reserva."
      );
    }
  }

  if (!obra) {
    return (
      <div className="container">
        <p>Carregando...</p>
      </div>
    );
  }

  const obraSemExemplares =
    tombos.length === 0;

  const reservaBloqueada =
    obraSemExemplares ||
    possuiExemplarDisponivel;

  return (
    <div className="container">
      <Card
        title={
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <IconButton onClick={voltar}>
              <ArrowBackIosIcon />
            </IconButton>

            <span>
              Confirmar Reserva
            </span>
          </Stack>
        }
      >
        <h4>Obra Selecionada</h4>

        <table className="table table-bordered mb-4">
          <tbody>

            <tr>
              <th>Título</th>
              <td>
                {toTitleCase(
                  obra.titulo
                )}
              </td>
            </tr>

            <tr>
              <th>Autores</th>
              <td>
                {obra.autores?.length
                  ? obra.autores
                      .map(toTitleCase)
                      .join(", ")
                  : "Não informado"}
              </td>
            </tr>

            <tr>
              <th>Editoras</th>
              <td>
                {obra.editoras?.length
                  ? obra.editoras
                      .map(toTitleCase)
                      .join(", ")
                  : "Não informado"}
              </td>
            </tr>

            <tr>
              <th>Gêneros</th>
              <td>
                {obra.generos?.length
                  ? obra.generos
                      .map(toTitleCase)
                      .join(", ")
                  : "Não informado"}
              </td>
            </tr>

            <tr>
              <th>Idiomas</th>
              <td>
                {obra.idiomas?.length
                  ? obra.idiomas
                      .map(toTitleCase)
                      .join(", ")
                  : "Não informado"}
              </td>
            </tr>

            <tr>
              <th>Total de Exemplares</th>
              <td>{tombos.length}</td>
            </tr>

          </tbody>
        </table>

        <h4>Exemplares da Obra</h4>

        <table className="table table-bordered mb-4">
          <thead>
            <tr>
              <th>Tombo</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {tombos.length === 0 ? (
              <tr>
                <td colSpan="2">
                  Nenhum exemplar cadastrado
                </td>
              </tr>
            ) : (
              tombos.map((t, index) => (
                <tr key={index}>
                  <td>{t.tombo}</td>

                  <td>
                    {toTitleCase(
                      t.status
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {obraSemExemplares && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            Esta obra não possui exemplares
            cadastrados.

            <br />

            Não é permitido criar reservas
            para obras sem exemplares.
          </Alert>
        )}

        {possuiExemplarDisponivel && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
          >
            Existe pelo menos um exemplar
            disponível para empréstimo.

            <br />

            De acordo com as regras da
            biblioteca, não é permitido
            reservar uma obra que possua
            exemplar disponível.
          </Alert>
        )}

        {!reservaBloqueada && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
          >
            A reserva será inserida na fila
            de espera da obra.

            <br />

            Quando um exemplar for liberado,
            a reserva poderá passar para o
            status "Disponível Para
            Retirada".
          </Alert>
        )}

        <h4>Resumo da Operação</h4>

        <table className="table table-bordered mb-4">
          <tbody>

            <tr>
              <th>Status Inicial</th>
              <td>Solicitada</td>
            </tr>

            <tr>
              <th>Posição na Fila</th>
              <td>
                Definida automaticamente
                pelo sistema
              </td>
            </tr>

            <tr>
              <th>Disponibilização</th>
              <td>
                O exemplar será associado
                automaticamente quando
                chegar a vez desta reserva.
              </td>
            </tr>

          </tbody>
        </table>

        <div className="d-flex justify-content-end gap-2">

          <Button
            variant="outlined"
            onClick={voltar}
          >
            Voltar
          </Button>

          <Button
            variant="contained"
            color="secondary"
            disabled={reservaBloqueada}
            onClick={confirmar}
          >
            Confirmar Reserva
          </Button>

        </div>
      </Card>
    </div>
  );
}

export default ConfirmarReserva;