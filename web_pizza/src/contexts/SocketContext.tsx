'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { parseCookies } from 'nookies';

interface SocketContextData {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext({} as SocketContextData);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Obter token? Se necessário no futuro
        // const { '@nextauth.token': token } = parseCookies();

        // URL do backend. Em dev é localhost:3333.
        // O ideal é usar variável de ambiente, mas vou hardcodar o fallback
        const socketUrl = 'http://localhost:3333';

        const socketInstance = io(socketUrl, {
            transports: ['websocket'], // Forçar websocket
            autoConnect: true,
            reconnection: true
        });

        socketInstance.on('connect', () => {
            console.log('Socket conectado:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket desconectado');
            setIsConnected(false);
        });

        // Log para debug de eventos recebidos
        socketInstance.onAny((event, ...args) => {
            console.log(`[Socket] Evento recebido: ${event}`, args);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        }
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext);
