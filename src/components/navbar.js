import React from "react";
import "bootswatch/dist/flatly/bootstrap.css";
import NavbarItem from "./navbarItem";

function Navbar() {

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top navbar-dark bg-primary">
      <div className="container">

        <a className="navbar-brand" href="/listagem-obras">
          Sistema de Biblioteca
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarResponsive">

          <ul className="navbar-nav me-auto">

            {role === "ADMIN" && (
              <NavbarItem
                render={true}
                href="/listagem-clientes"
                label="Clientes"
              />
            )}

            <NavbarItem
              render={true}
              href="/listagem-obras"
              label="Obras"
            />

            {role === "ADMIN" && (
              <NavbarItem
                render={true}
                href="/relatorios"
                label="Relatórios"
              />
            )}

            {role === "ADMIN" && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Administração
                </a>

                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="/listagem-idiomas">Idiomas</a></li>
                  <li><a className="dropdown-item" href="/listagem-editoras">Editoras</a></li>
                  <li><a className="dropdown-item" href="/listagem-generos">Gêneros</a></li>
                  <li><a className="dropdown-item" href="/listagem-secoes">Seções</a></li>
                </ul>
              </li>
            )}

          </ul>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button
                className="btn btn-outline-light"
                onClick={logout}
              >
                Logout
              </button>
            </li>
          </ul>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;