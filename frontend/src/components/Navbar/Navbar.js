import React from 'react';
import styles from './Navbar.module.css';
import logoImage from '../../assets/logo_bia.png';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className={styles.navbar}>
      <div className={styles.title}>
        <img src={logoImage} alt="SoccerCircle Logo" className={styles.logo} />
        CueMatch
      </div>
      <ul className={styles.menu}>
        <li>
          <NavLink
            to="/homefeed"
            className={({ isActive }) => isActive ? styles.active : undefined}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? styles.active : undefined}>
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/favourites" className={({ isActive }) => isActive ? styles.active : undefined}>
            Favourites
          </NavLink>
        </li>
        <li>
          <NavLink to="/friends" className={({ isActive }) => isActive ? styles.active : undefined}>
            Friends
          </NavLink>
        </li>
        <li>
          <NavLink to="/groups" className={({ isActive }) => isActive ? styles.active : undefined}>
            Groups
          </NavLink>
        </li>
        <li>
          <NavLink to="/matching" className={({ isActive }) => isActive ? styles.active : undefined}>
            Matching
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;

