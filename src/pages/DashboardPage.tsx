import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <p>Role: {user?.role}</p>

      <button type="button" onClick={logout}>
        Sign out
      </button>
    </main>
  );
}