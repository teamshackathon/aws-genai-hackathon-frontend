import useWebSocket, { ReadyState } from "react-use-websocket";

import type { WebSocketOptions } from "@/lib/type/websocket";
import { useState } from "react";

export const useRecipeGenWebSocket = ({
	onMessage,
	reconnectAttempts = 5,
	reconnectInterval = 3000,
}: WebSocketOptions) => {
	const baseURL = import.meta.env.VITE_PUBLIC_API_URL;

	const [connectionStatus, setConnectionStatus] =
		useState<string>("Uninstantiated");

	const { sendMessage, lastMessage, readyState } = useWebSocket(
		`${baseURL}/ws/recipe-gen`,
		{
			reconnectAttempts,
			reconnectInterval,
			onMessage: onMessage,
			shouldReconnect: (closeEvent) => {
				// WebSocketが閉じられた場合に再接続するかどうかを決定
				return closeEvent.code !== 1000; // 正常終了以外は再接続
			},
		},
	);

	setConnectionStatus(
		{
			[ReadyState.CONNECTING]: "Connecting",
			[ReadyState.OPEN]: "Open",
			[ReadyState.CLOSING]: "Closing",
			[ReadyState.CLOSED]: "Closed",
			[ReadyState.UNINSTANTIATED]: "Uninstantiated",
		}[readyState] || "Unknown",
	);

	return {
		sendMessage,
		lastMessage,
		connectionStatus,
		readyState,
	};
};
