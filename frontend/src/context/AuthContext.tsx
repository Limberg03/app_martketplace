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

export interface AuthContextType {
  user: User | null;
  login: (correo: string, pass: string) => Promise<User | null>;
  register: (nombre: string, correo: string, pass: string, rol: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<boolean>;
  updateLocalUser: (data: Partial<User>) => void;
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  requestPushPermission: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nexus_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_user', JSON.stringify(user));
      initNotifications(user.id);
    } else {
      localStorage.removeItem('nexus_user');
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Función auxiliar para convertir VAPID a Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const initNotifications = async (userId: number) => {
    try {
      // 1. Obtener historial de notificaciones
      const res = await fetch(`${API_URL}/notificaciones/${userId}`, {
        headers: { 'Authorization': `Bearer ${user?.id || userId}` } // Usamos ID como auth simulación
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.leido).length);
      }

      // 2. Conectar WebSocket
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${window.location.host}/api/notificaciones/ws/${userId}`;
      const ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const notif = JSON.parse(event.data);
          if (notif.type === 'NEW_NOTIFICATION') {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Sonido opcional
            try { new Audio('/notification.mp3').play().catch(() => {}); } catch {}
          }
        } catch {}
      };
      // Keep alive
      setInterval(() => { if(ws.readyState === 1) ws.send('ping'); }, 30000);

      // 3. Registrar Service Worker y Web Push
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        await navigator.serviceWorker.register('/sw.js');
        // No pedimos permiso automáticamente para evitar que el navegador lo bloquee.
        // Lo haremos manualmente a través de requestPushPermission.
        if (Notification.permission === 'granted') {
           await subscribeToPush(userId);
        }
      }
    } catch (e) {
      console.error("Error inicializando notificaciones", e);
    }
  };

  const subscribeToPush = async (userId: number) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidRes = await fetch(`${API_URL}/notificaciones/vapid-public-key`);
      const { public_key } = await vapidRes.json();
      
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(public_key)
        });
      }
      
      // Enviar suscripción al backend
      await fetch(`${API_URL}/notificaciones/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys?.p256dh,
            auth: subscription.toJSON().keys?.auth
          }
        })
      });
    } catch (e) {
      console.error("Error suscribiendo a push", e);
    }
  };

  const requestPushPermission = async () => {
    if (!user) return;
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeToPush(user.id);
        alert('Notificaciones activadas exitosamente.');
      } else {
        alert('Permiso denegado para notificaciones.');
      }
    }
  };

  const markAsRead = async (id: number) => {
    if (!user) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    fetch(`${API_URL}/notificaciones/${id}/leer?usuario_id=${user.id}`, { method: 'POST' }).catch(() => {});
  };

  // CU2 – Inicio de sesión
  const login = async (correo: string, pass: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password: pass }),
      });
      if (res.ok) { 
        const userData = await res.json();
        setUser(userData); 
        return userData; 
      }
      return null;
    } catch { return null; }
  };

  // CU1 – Registro
  const register = async (nombre: string, correo: string, pass: string, rol: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, password: pass, rol }),
      });
      if (res.ok) {
        return await login(correo, pass);
      }
      return null;
    } catch { return null; }
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

  const updateLocalUser = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, uploadPhoto, updateLocalUser, notifications, unreadCount, markAsRead, requestPushPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
