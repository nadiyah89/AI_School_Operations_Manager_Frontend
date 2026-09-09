import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { login as loginApi } from "../api/authApi";
import type { LoginCredentials } from "../types/auth";
import type { User } from "../types/user";

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  nameid?: string;
  emailaddress?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getUserFromToken(token: string): User {
  const payload = jwtDecode<JwtPayload>(token);

  const id =
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ??
    payload.sub ??
    payload.nameid;

  const email =
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ] ??
    payload.email ??
    payload.emailaddress;

  const role =
    payload[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] ?? payload.role;

  if (!id || !email || !role) {
    throw new Error("Invalid authentication token.");
  }

  if (!["Admin", "Student", "Teacher", "Parent"].includes(role)) {
    throw new Error("Invalid user role.");
  }

  return {
    id,
    email,
    role: role as User["role"],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token"),
  );

  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem("auth_token");

    if (!storedToken) {
      return null;
    }

    try {
      return getUserFromToken(storedToken);
    } catch {
      localStorage.removeItem("auth_token");
      return null;
    }
  });

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      setUser(getUserFromToken(token));
    } catch {
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    }
  }, [token]);

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await loginApi(credentials);

    const decodedUser = getUserFromToken(response.token);

    localStorage.setItem("auth_token", response.token);

    setToken(response.token);
    setUser(decodedUser);
  }

  function logout(): void {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: token !== null && user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}