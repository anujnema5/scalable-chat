'use client'
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

type TSocketeProvider = {
    children: React.ReactNode
}

type TSocketContext = {
    sendMessage: (str: string) => any,
    message: string[];
}

const SocketContext = createContext<TSocketContext | null>(null);

export const useSocket = () => {
    const state = useContext(SocketContext);
    if (!state) throw new Error('The component is not under socket provider');

    return state;
}

const SocketProvider: React.FC<TSocketeProvider> = ({ children }) => {
    const [socket, setSocket] = useState<Socket>();
    const [message, setMessage] = useState<string[]>([]);

    const sendMessage = useCallback((msg: string) => {
        if (!socket) throw new Error('socket server not connected');
        socket.emit('event:message', { message: msg })
    }, [socket])

    const onMsgRecieved = useCallback((msg: string) => {
        console.log("I am triggering")
        const { message } = JSON.parse(msg) as { message: string }
        console.log("New Message recieved " + message);
        setMessage((prev) => [...prev, message])
    }, [])

    useEffect(() => {
        const _socket = io('http://localhost:8000')
        setSocket(_socket);

        _socket.on('message', onMsgRecieved);

        return () => {
            _socket.off("message", onMsgRecieved)
            _socket.disconnect();
            setSocket(undefined);
        }
    }, [])

    return (
        <SocketContext.Provider value={{ sendMessage, message }}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider;
