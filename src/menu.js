import React from "react";
import { Link } from "react-router-dom";

function Menu() {
  const token = localStorage.getItem("token");
  
  const rawRole = localStorage.getItem("role");
  const role = rawRole ? rawRole.trim().toUpperCase() : "";

  if (!token) {
    return null;
  }

  const isAdmin = role.includes("ADMIN");

  return (
    <div className="menu">
      <ul>
        <li><Link to="/listagem-obras">Obras</Link></li>
        <li><Link to="/listagem-clientes">Clientes</Link></li>
        <li><Link to="/listagem-emprestimos">Meus empréstimos</Link></li>
        <li><Link to="/selecionar-obra/1">Empréstimos</Link></li>
        
        <li><Link to="/cadastro-obra">Cadastro Obra</Link></li>
        <li><Link to="/cadastro-autor">Cadastro Autor</Link></li>
        <li><Link to="/cadastro-editora">Cadastro Editora</Link></li>

        {isAdmin && (
          <>
            <li style={{ color: "#ffc107", fontWeight: "bold", marginTop: "10px", listStyle: "none" }}>
              [Painel Admin]
            </li>
            <li><Link to="/listagem-usuarios">Usuários</Link></li>
            <li><Link to="/configuracao-multas">Regras de Circulação</Link></li>
            <li><Link to="/relatorios">Relatórios</Link></li>
          </>
        )}
      </ul>
    </div>
  );
}

export default Menu;