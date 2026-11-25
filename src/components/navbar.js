import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavbarItem from './navbarItem';

function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function toggleMenu(menuName, e) {
    e.preventDefault();
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  }

  function closeMenu() {
    setOpenMenu(null);
  }

  return (
    <nav
      ref={navRef}
      className="navbar navbar-expand-lg fixed-top navbar-dark bg-primary shadow-sm"
    >
      <div className="container">
        <Link
          to="/listagem-projetos"
          className="navbar-brand fw-semibold"
          onClick={closeMenu}
        >
          Kanban Web
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav me-auto">
            <li
              className={`nav-item dropdown ${
                openMenu === 'pessoas' ? 'show' : ''
              }`}
            >
              <a
                className={`nav-link dropdown-toggle ${
                  openMenu === 'pessoas' ? 'show' : ''
                }`}
                href="#gestao-pessoas"
                role="button"
                aria-expanded={openMenu === 'pessoas'}
                onClick={(e) => toggleMenu('pessoas', e)}
              >
                Gestão de Pessoas
              </a>
              <ul
                className={`dropdown-menu ${
                  openMenu === 'pessoas' ? 'show' : ''
                }`}
              >
                <NavbarItem
                  render={true}
                  href="/listagem-funcionarios"
                  label="Funcionários"
                  isDropdownItem={true}
                  onClick={closeMenu}
                />
                <NavbarItem
                  render={true}
                  href="/listagem-cargos"
                  label="Cargos"
                  isDropdownItem={true}
                  onClick={closeMenu}
                />
              </ul>
            </li>

            <li
              className={`nav-item dropdown ${
                openMenu === 'projetos' ? 'show' : ''
              }`}
            >
              <a
                className={`nav-link dropdown-toggle ${
                  openMenu === 'projetos' ? 'show' : ''
                }`}
                href="#gestao-projetos"
                role="button"
                aria-expanded={openMenu === 'projetos'}
                onClick={(e) => toggleMenu('projetos', e)}
              >
                Gestão de Projetos
              </a>
              <ul
                className={`dropdown-menu ${
                  openMenu === 'projetos' ? 'show' : ''
                }`}
              >
                <NavbarItem
                  render={true}
                  href="/listagem-projetos"
                  label="Projetos"
                  isDropdownItem={true}
                  onClick={closeMenu}
                />
                <NavbarItem
                  render={true}
                  href="/listagem-areas-projeto"
                  label="Áreas de Projetos"
                  isDropdownItem={true}
                  onClick={closeMenu}
                />
                <NavbarItem
                  render={true}
                  href="/listagem-prioridades"
                  label="Prioridades"
                  isDropdownItem={true}
                  onClick={closeMenu}
                />
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;