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

      <p className={styles.sectionTitle}>Academics</p>

      <NavLink
  to="/academics/performance"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Academic Performance
</NavLink>


      <p className={styles.sectionTitle}>Operations</p>


<NavLink
  to="/operations/attendance"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Attendance
</NavLink>

<NavLink
  to="/operations/meetings"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Meetings
</NavLink>

<NavLink
  to="/operations/documents"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Documents
</NavLink>

<NavLink
  to="/operations/notifications"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Notifications
</NavLink>


      <p className={styles.sectionTitle}>Administration</p>

      <NavLink
  to="/administration/admissions"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Admissions
</NavLink>


<NavLink
  to="/administration/fees"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  Fee Records
</NavLink>

      <p className={styles.sectionTitle}>AI</p>

  <NavLink
  to="/ai"
  className={({ isActive }) =>
    isActive ? styles.navItemActive : styles.navItem
  }
>
  AI Assistant
</NavLink>



      </nav>

      <div className={styles.account}>
        Account
      </div>
    </aside>
  );
}