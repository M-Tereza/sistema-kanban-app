import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import ListagemCargos from './views/listagem-cargos';
import CadastroCargo from './views/cadastro-cargo';

import ListagemAreasProjeto from './views/listagem-areas-projeto';
import CadastroAreaProjeto from './views/cadastro-area-projeto';

import ListagemPrioridades from './views/listagem-prioridades';
import CadastroPrioridade from './views/cadastro-prioridade';

import ListagemFuncionarios from './views/listagem-funcionarios';
import CadastroFuncionario from './views/cadastro-funcionario';
import PerfilFuncionario from './views/perfil-funcionario';

import ListagemProjetos from './views/listagem-projetos';
import CadastroProjeto from './views/cadastro-projeto';
import PerfilProjeto from './views/perfil-projeto';

import ListagemFuncionariosProjeto from './views/listagem-funcionarios-projeto';
import CadastroFuncionarioProjeto from './views/cadastro-funcionario-projeto';

import ListagemEtiquetas from './views/listagem-etiquetas';
import CadastroEtiqueta from './views/cadastro-etiqueta';

import CadastroTarefa from './views/cadastro-tarefa';
import PerfilTarefa from './views/perfil-tarefa';

function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/listagem-projetos" replace />} />

      <Route path="/listagem-cargos" element={<ListagemCargos />} />
      <Route path="/cadastro-cargo/:idParam?" element={<CadastroCargo />} />

      <Route path="/listagem-areas-projeto" element={<ListagemAreasProjeto />} />
      <Route path="/cadastro-area-projeto/:idParam?" element={<CadastroAreaProjeto />} />

      <Route path="/listagem-prioridades" element={<ListagemPrioridades />} />
      <Route path="/cadastro-prioridade/:idParam?" element={<CadastroPrioridade />} />

      <Route path="/listagem-funcionarios" element={<ListagemFuncionarios />} />
      <Route path="/cadastro-funcionario/:idParam?" element={<CadastroFuncionario />} />
      <Route path="/perfil-funcionario/:idParam" element={<PerfilFuncionario />} />

      <Route path="/listagem-projetos" element={<ListagemProjetos />} />
      <Route path="/cadastro-projeto/:idParam?" element={<CadastroProjeto />} />
      <Route path="/perfil-projeto/:idParam" element={<PerfilProjeto />} />

      <Route path="/listagem-funcionarios-projeto" element={<ListagemFuncionariosProjeto />} />
      <Route path="/cadastro-funcionario-projeto/:idParam?" element={<CadastroFuncionarioProjeto />} />

      <Route path="/listagem-etiquetas" element={<ListagemEtiquetas />} />
      <Route path="/cadastro-etiqueta/:idParam?" element={<CadastroEtiqueta />} />

      <Route path="/cadastro-tarefa/:idParam?" element={<CadastroTarefa />} />
      <Route path="/perfil-tarefa/:idParam" element={<PerfilTarefa />} />
    </Routes>
  );
}

export default Rotas;