import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Header />

      <Sidebar />

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}