import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE = "http://localhost:5000/api";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("bf_token");
    const storedUser = localStorage.getItem("bf_user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("bf_token");
        localStorage.removeItem("bf_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error("Cannot connect to the server. Please make sure the backend is running and try again.");
    }
    if (!res.ok) {
      let errMsg = "Login failed.";
      try {
        const err = await res.json();
        errMsg = err.message || errMsg;
      } catch { /* ignore parse errors */ }
      throw new Error(errMsg);
    }
    const data = await res.json();
    setToken(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    localStorage.setItem("bf_token", data.token);
    localStorage.setItem("bf_user", JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
  };

  const register = async (name: string, email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
    } catch {
      throw new Error("Cannot connect to the server. Please make sure the backend is running and try again.");
    }
    if (!res.ok) {
      let errMsg = "Registration failed.";
      try {
        const err = await res.json();
        errMsg = err.message || errMsg;
      } catch { /* ignore parse errors */ }
      throw new Error(errMsg);
    }
    const data = await res.json();
    setToken(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    localStorage.setItem("bf_token", data.token);
    localStorage.setItem("bf_user", JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("bf_token");
    localStorage.removeItem("bf_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
