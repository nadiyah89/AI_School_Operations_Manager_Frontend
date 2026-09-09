import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span>Menu</span>
      </div>

      <div className={styles.center}>
        <span>Dashboard</span>
      </div>

      <div className={styles.right}>
        <span>Admin</span>
      </div>
    </header>
  );
}