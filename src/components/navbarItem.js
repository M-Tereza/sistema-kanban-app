import React from 'react';
import { Link } from 'react-router-dom';

function NavbarItem({
  render = true,
  label,
  href,
  onClick,
  dropdown,
  items = [],
  isDropdownItem = false,
}) {
  if (!render) return null;

  if (dropdown) {
    return (
      <li className="nav-item dropdown">
        <button
          type="button"
          className="nav-link dropdown-toggle btn btn-link text-decoration-none"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {label}
        </button>

        <ul className="dropdown-menu">
          {items.map((item) => (
            <li key={item.href}>
              <Link className="dropdown-item" to={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  if (isDropdownItem) {
    return (
      <li>
        <Link onClick={onClick} className="dropdown-item" to={href}>
          {label}
        </Link>
      </li>
    );
  }

  return (
    <li className="nav-item">
      <Link onClick={onClick} className="nav-link" to={href}>
        {label}
      </Link>
    </li>
  );
}

export default NavbarItem;