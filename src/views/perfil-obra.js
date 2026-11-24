import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../components/card";
import { mensagemSucesso, mensagemErro } from "../components/toastr";
import axios, { API_URLS } from "../config/axios";

import {
Button,
Stack,
IconButton,
Menu,
MenuItem,
Chip
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBack";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { toTitleCase } from "../utils/formatadores";

const obrasURL = `${API_URLS}/obras`;
const exemplaresURL = `${API_URLS}/exemplares`;

const formatArrayTitleCase = (arr) => {
if (!arr || arr.length === 0) return [];
return arr.map(toTitleCase);
};

const STATUS = {
DISPONIVEL: 1,
RESERVADO: 2,
EM_POSSE: 3,
EM_ATRASO: 4,
EXTRAVIADO: 5,
DANIFICADO: 6,
};

function PerfilObra() {

const { id } = useParams();

const navigate = useNavigate();

const [obra, setObra] = React.useState(null);

const [exemplares, setExemplares] = React.useState([]);

const [openExcluirObra, setOpenExcluirObra] =
React.useState(false);

const [openExcluirExemplar, setOpenExcluirExemplar] =
React.useState(false);

const [exemplarSelecionado, setExemplarSelecionado] =
React.useState(null);

const [anchorStatus, setAnchorStatus] =
React.useState(null);

const [exemplarStatusSelecionado,
setExemplarStatusSelecionado] =
React.useState(null);

const voltar =
() => navigate("/listagem-obras");

const editar =
() => navigate(`/cadastro-obra/${id}`);

const cadastrarExemplar =
() => navigate(`/cadastro-exemplar?idObra=${id}`);

const editarExemplar =
(idExemplar) =>
navigate(`/cadastro-exemplar/${idExemplar}`);

React.useEffect(() => {
carregar();
}, [id]);

const carregar = async () => {

try {

  const obraResponse =
    await axios.get(`${obrasURL}/${id}`);

  setObra(
    obraResponse.data
  );

  const exemplaresResponse =
    await axios.get(exemplaresURL);

  setExemplares(
    (exemplaresResponse.data || []).filter(
      (e) => e.idObra === Number(id)
    )
  );

} catch {

  mensagemErro(
    "Erro ao carregar dados."
  );

}


};

const obterCorStatus = (idStatus) => {


switch (idStatus) {

  case STATUS.DISPONIVEL:
    return "success";

  case STATUS.RESERVADO:
    return "warning";

  case STATUS.EM_POSSE:
    return "primary";

  case STATUS.EM_ATRASO:
    return "error";

  case STATUS.EXTRAVIADO:
    return "default";

  case STATUS.DANIFICADO:
    return "secondary";

  default:
    return "default";
}


};

const obterStatusPermitidos = (exemplar) => {


const atual =
  exemplar.idStatusExemplar;

switch (atual) {

  case STATUS.DISPONIVEL:

    return [
      {
        id: STATUS.EXTRAVIADO,
        nome: "Extraviado"
      },
      {
        id: STATUS.DANIFICADO,
        nome: "Danificado"
      }
    ];

  case STATUS.RESERVADO:

    return [
      {
        id: STATUS.EXTRAVIADO,
        nome: "Extraviado"
      },
      {
        id: STATUS.DANIFICADO,
        nome: "Danificado"
      }
    ];

  case STATUS.EXTRAVIADO:

    return [
      {
        id: STATUS.DISPONIVEL,
        nome: "Disponível"
      }
    ];

  case STATUS.DANIFICADO:

    return [
      {
        id: STATUS.DISPONIVEL,
        nome: "Disponível"
      }
    ];

  default:
    return [];
}


};

const abrirMenuStatus =
(event, exemplar) => {


  setAnchorStatus(
    event.currentTarget
  );

  setExemplarStatusSelecionado(
    exemplar
  );
};


const fecharMenuStatus = () => {


setAnchorStatus(null);

setExemplarStatusSelecionado(
  null
);


};

const alterarStatus = async (novoStatus) => {


try {

  const response =
    await axios.patch(
      `${exemplaresURL}/${exemplarStatusSelecionado.id}/status/${novoStatus}`
    );

  const exemplarAtualizado =
    response.data;

  setExemplares((lista) =>
    lista.map((item) =>
      item.id === exemplarAtualizado.id
        ? exemplarAtualizado
        : item
    )
  );

  mensagemSucesso(
    "Status alterado com sucesso!"
  );

} catch (error) {

  mensagemErro(
    error?.response?.data ||
    "Erro ao alterar status."
  );

} finally {

  fecharMenuStatus();

}


};

const excluirObra = async () => {


try {

  await axios.delete(
    `${obrasURL}/${id}`
  );

  mensagemSucesso(
    "Obra excluída com sucesso!"
  );

  navigate(
    "/listagem-obras"
  );

} catch {

  mensagemErro(
    "Erro ao excluir obra."
  );

} finally {

  setOpenExcluirObra(
    false
  );

}


};

const excluirExemplar = async () => {


if (!exemplarSelecionado) {
  return;
}

try {

  await axios.delete(
    `${exemplaresURL}/${exemplarSelecionado.id}`
  );

  mensagemSucesso(
    "Exemplar excluído com sucesso!"
  );

  setExemplares((lista) =>
    lista.filter(
      (e) =>
        e.id !== exemplarSelecionado.id
    )
  );

} catch {

  mensagemErro(
    "Erro ao excluir exemplar."
  );

} finally {

  setOpenExcluirExemplar(false);

  setExemplarSelecionado(null);

}

};

if (!obra) {
return null;
}

return ( <div className="container">

  <Card
    title={
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >

        <IconButton
          onClick={voltar}
        >
          <ArrowBackIosIcon />
        </IconButton>

        <span>
          Perfil da Obra
        </span>

      </Stack>
    }
  >

    <p>
      <strong>Código:</strong>{" "}
      {obra.id}
    </p>

    <p>
      <strong>Título:</strong>{" "}
      {toTitleCase(
        obra.titulo
      )}
    </p>

    <p>
      <strong>ISBN:</strong>{" "}
      {obra.isbn}
    </p>

    <p>
      <strong>Edição:</strong>{" "}
      {obra.edicao}
    </p>

    <p>
      <strong>Autores:</strong>{" "}
      {obra.autores?.length
        ? formatArrayTitleCase(
            obra.autores
          ).join(", ")
        : "Nenhum Autor Cadastrado"}
    </p>

    <p>
      <strong>Editoras:</strong>{" "}
      {obra.editoras?.length
        ? formatArrayTitleCase(
            obra.editoras
          ).join(", ")
        : "Nenhuma Editora Cadastrada"}
    </p>

    <p>
      <strong>Gêneros:</strong>{" "}
      {obra.generos?.length
        ? formatArrayTitleCase(
            obra.generos
          ).join(", ")
        : "Nenhum Gênero Cadastrado"}
    </p>

    <p>
      <strong>Idiomas:</strong>{" "}
      {obra.idiomas?.length
        ? formatArrayTitleCase(
            obra.idiomas
          ).join(", ")
        : "Nenhum Idioma Cadastrado"}
    </p>

    <Stack
      direction="row"
      spacing={2}
      mt={3}
    >

      <Button
        variant="contained"
        onClick={editar}
      >
        Editar
      </Button>

      <Button
        variant="contained"
        color="error"
        onClick={() =>
          setOpenExcluirObra(
            true
          )
        }
      >
        Excluir Obra
      </Button>

    </Stack>

    <hr />

    <div
      className="d-flex justify-content-between align-items-center"
    >

      <h5>
        Exemplares
      </h5>

      <Button
        variant="contained"
        color="warning"
        onClick={
          cadastrarExemplar
        }
      >
        Novo Exemplar
      </Button>

    </div>

        <table className="table table-hover mt-3">

          <thead>

            <tr>

              <th>Tombo</th>

              <th>Código de Barras</th>

              <th>Data Aquisição</th>

              <th>Seção</th>

              <th>Status</th>

              <th>Ações</th>

            </tr>

          </thead>

          <tbody>

            {exemplares.length > 0 ? (

              exemplares.map((ex) => (

                <tr key={ex.id}>

                  <td>
                    {ex.tombo}
                  </td>

                  <td>
                    {ex.codigoBarras}
                  </td>

                  <td>

                    {ex.dataAquisicao
                      ? new Date(
                          ex.dataAquisicao
                        ).toLocaleDateString(
                          "pt-BR"
                        )
                      : "-"}

                  </td>

                  <td>

                    {ex.nomeSecao
                      ? toTitleCase(
                          ex.nomeSecao
                        )
                      : "-"}

                  </td>

                  <td>

                    <Chip
                      label={toTitleCase(
                        ex.nomeStatusExemplar
                      )}
                      color={obterCorStatus(
                        ex.idStatusExemplar
                      )}
                      size="small"
                    />

                  </td>

                  <td>

                    <IconButton
                      onClick={() =>
                        editarExemplar(
                          ex.id
                        )
                      }
                      title="Visualizar"
                    >
                      <VisibilityIcon />
                    </IconButton>

                    {obterStatusPermitidos(
                      ex
                    ).length > 0 && (

                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        sx={{
                          mr: 1
                        }}
                        onClick={(event) =>
                          abrirMenuStatus(
                            event,
                            ex
                          )
                        }
                      >
                        Status
                      </Button>

                    )}

                    <IconButton
                      onClick={() => {

                        setExemplarSelecionado(
                          ex
                        );

                        setOpenExcluirExemplar(
                          true
                        );

                      }}
                      title="Excluir"
                    >
                      <DeleteIcon />
                    </IconButton>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="text-center"
                >
                  Nenhum exemplar cadastrado.
                </td>

              </tr>

            )}

          </tbody>

        </table>

        <Menu
          anchorEl={anchorStatus}
          open={Boolean(anchorStatus)}
          onClose={fecharMenuStatus}
        >

          {exemplarStatusSelecionado &&
            obterStatusPermitidos(
              exemplarStatusSelecionado
            ).map((status) => (

              <MenuItem
                key={status.id}
                onClick={() =>
                  alterarStatus(
                    status.id
                  )
                }
              >
                {status.nome}
              </MenuItem>

            ))}

        </Menu>

        <Dialog
          open={openExcluirObra}
          onClose={() =>
            setOpenExcluirObra(
              false
            )
          }
        >

          <DialogTitle>
            Excluir Obra
          </DialogTitle>

          <DialogContent>

            <DialogContentText>

              Tem certeza que deseja excluir
              a obra{" "}

              <strong>
                {toTitleCase(
                  obra.titulo
                )}
              </strong>

              ?

            </DialogContentText>

          </DialogContent>

          <DialogActions>

            <Button
              onClick={() =>
                setOpenExcluirObra(
                  false
                )
              }
            >
              Cancelar
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={
                excluirObra
              }
            >
              Excluir
            </Button>

          </DialogActions>

        </Dialog>

        <Dialog
          open={
            openExcluirExemplar
          }
          onClose={() =>
            setOpenExcluirExemplar(
              false
            )
          }
        >

          <DialogTitle>
            Excluir Exemplar
          </DialogTitle>

          <DialogContent>

            <DialogContentText>

              Tem certeza que deseja excluir
              o exemplar de tombo{" "}

              <strong>
                {
                  exemplarSelecionado?.tombo
                }
              </strong>

              ?

            </DialogContentText>

          </DialogContent>

          <DialogActions>

            <Button
              onClick={() =>
                setOpenExcluirExemplar(
                  false
                )
              }
            >
              Cancelar
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={
                excluirExemplar
              }
            >
              Excluir
            </Button>

          </DialogActions>

        </Dialog>

      </Card>

    </div>
  );

}
export default PerfilObra;

