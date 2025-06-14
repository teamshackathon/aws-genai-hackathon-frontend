import useWebSocket, { ReadyState } from "react-use-websocket";

import { authTokenAtom } from "@/lib/atom/AuthAtom";
import type { WebSocketOptions } from "@/lib/type/websocket";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { recipeUrlAtom } from "../atom/RecipeAtom";
import { sessionAtomLoadable } from "../atom/SessionAtom";
import { useLoadableAtom } from "./useLoadableAtom";

export const useRecipeGenWebSocket = ({
	onMessage,
	reconnectAttempts = 5,
	reconnectInterval = 3000,
	shouldConnect = false,
}: WebSocketOptions) => {
	const baseURL = import.meta.env.VITE_PUBLIC_API_URL;
	const authToken = useAtomValue(authTokenAtom);
	const session = useLoadableAtom(sessionAtomLoadable);
	const recipeUrl = useAtomValue(recipeUrlAtom);

	const [connectionStatus, setConnectionStatus] =
		useState<string>("Uninstantiated");

	const sessionId = session?.sessionId || "";

	const { sendMessage, lastMessage, readyState } = useWebSocket(
		shouldConnect
			? `${baseURL}/ws/recipe-gen?token=${authToken}&session_id=${sessionId}&url=${recipeUrl || ""}`
			: null,
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

	useEffect(() => {
		setConnectionStatus(
			{
				[ReadyState.CONNECTING]: "Connecting",
				[ReadyState.OPEN]: "Open",
				[ReadyState.CLOSING]: "Closing",
				[ReadyState.CLOSED]: "Closed",
				[ReadyState.UNINSTANTIATED]: "Uninstantiated",
			}[readyState] || "Unknown",
		);
	}, [readyState]);

	return {
		sendMessage,
		lastMessage,
		connectionStatus,
		readyState,
		disconnect: () => {
			// WebSocket接続を閉じる
			if (readyState === ReadyState.OPEN) {
				// react-use-websocketには直接disconnect機能がないため、shouldConnectをfalseにして接続を切断
			}
		},
	};
};
