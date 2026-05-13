/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: 'VENDEDOR' | 'COMPRADOR';
  plan_suscripcion: string;
  consultas_ia: number;
  telefono?: string;
  descripcion?: string;
  foto_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (correo: string, pass: string) => Promise<boolean>;
  register: (nombre: string, correo: string, pass: string, rol: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_URL = 'http://127.0.0.1:8000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nexus_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_user');
    }
  }, [user]);

  // CU2 – Inicio de sesión
  const login = async (correo: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password: pass }),
      });
      if (res.ok) { setUser(await res.json()); return true; }
      return false;
    } catch { return false; }
  };

  // CU1 – Registro
  const register = async (nombre: string, correo: string, pass: string, rol: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, password: pass, rol }),
      });
      if (res.ok) { setUser(await res.json()); return true; }
      return false;
    } catch { return false; }
  };

  // CU3 – Cierre de sesión
  const logout = () => {
    setUser(null);
  };

  // CU5 – Actualizar datos de perfil
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_URL}/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { setUser(await res.json()); return true; }
      return false;
    } catch { return false; }
  };

  // CU5 – Subir foto de perfil
  const uploadPhoto = async (file: File): Promise<boolean> => {
    if (!user) return false;
    try {
      const form = new FormData();
      form.append('foto', file);
      const res = await fetch(`${API_URL}/auth/profile/${user.id}/photo`, {
        method: 'POST',
        body: form,
      });
      if (res.ok) { setUser(await res.json()); return true; }
      return false;
    } catch { return false; }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, uploadPhoto }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
