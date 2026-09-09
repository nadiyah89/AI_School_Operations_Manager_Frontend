import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        School Operations Manager
      </div>

      <nav aria-label="Main navigation">
        <NavLink
           to="/dashboard"
           className={({ isActive }) =>
           isActive ? styles.navItemActive : styles.navItem
  }
>
  Dashboard
</NavLink>

 <p className={styles.sectionTitle}>Directory</p>

     <NavLink
    to="/directory/students"
    className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Students
</NavLink>

      <NavLink
  to="/directory/teachers"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Teachers
</NavLink>

<NavLink
  to="/directory/parents"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Parents
</NavLink>

      <p>Academics</p>

      <p>Operations</p>

      <p>Administration</p>

      <p>AI</p>

      </nav>

      <div className={styles.account}>
        Account
      </div>
    </aside>
  );
}