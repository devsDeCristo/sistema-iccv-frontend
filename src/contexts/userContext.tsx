import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types/user";
import { useNavigate } from "react-router-dom";

// Tipagem dos dados do usuário


interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Cria o contexto com valor padrão
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const logout = () => {
    setUser(null);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizado para acessar o contexto
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
}
