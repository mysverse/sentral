// src/hooks/useWebSocket.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type WebSocketStatus = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED";

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  shouldReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn<T> {
  sendMessage: (message: T) => void;
  lastMessage: T | null;
  status: WebSocketStatus;
}

const useWebSocket = <T = any>(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn<T> => {
  const {
    onOpen,
    onClose,
    onError,
    onMessage,
    shouldReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>("CONNECTING");

  const connect = useCallback(() => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = (event: Event) => {
      setStatus("OPEN");
      reconnectAttemptsRef.current = 0;
      onOpen && onOpen(event);
    };

    wsRef.current.onmessage = (event: MessageEvent) => {
      const data: T = JSON.parse(event.data);
      setLastMessage(data);
      onMessage && onMessage(event);
    };

    wsRef.current.onclose = (event: CloseEvent) => {
      setStatus("CLOSED");
      onClose && onClose(event);
      if (
        shouldReconnect &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptsRef.current += 1;
        setTimeout(() => {
          setStatus("CONNECTING");
          connect();
        }, reconnectInterval);
      }
    };

    wsRef.current.onerror = (event: Event) => {
      setStatus("CLOSED");
      onError && onError(event);
      wsRef.current?.close();
    };
  }, [
    url,
    onOpen,
    onClose,
    onError,
    onMessage,
    shouldReconnect,
    reconnectInterval,
    maxReconnectAttempts
  ]);

  useEffect(() => {
    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((message: T) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error(
        "WebSocket is not open. Ready state:",
        wsRef.current?.readyState
      );
    }
  }, []);

  return { sendMessage, lastMessage, status };
};

export default useWebSocket;
