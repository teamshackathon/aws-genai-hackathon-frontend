import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

import {
	WebSocketHistory,
	WebSocketHistoryList,
	type WebSocketHistoryListResponse,
	type WebSocketHistoryResponse,
} from "../type/websocket";

class WebSocketSession {
	constructor(
		public id: string,
		public userId: number,
		public sessionId: string,
		public status: string,
		public createdAt: Date,
		public updatedAt: Date,
	) {}
}

export interface WebSocketSessionResponse {
	id: string;
	user_id: number;
	session_id: string;
	status: string;
	created_at: string; // ISO 8601形式の文字列
	updated_at: string; // ISO 8601形式の文字列
}

export function createWebSocketSession(
	res: WebSocketSessionResponse,
): WebSocketSession {
	return new WebSocketSession(
		res.id,
		res.user_id,
		res.session_id,
		res.status,
		new Date(res.created_at),
		new Date(res.updated_at),
	);
}

export function createWebSocketHistory(
	res: WebSocketHistoryResponse,
): WebSocketHistory {
	return new WebSocketHistory(
		res.message_type,
		res.message_id,
		res.content,
		res.metadata,
		new Date(res.timestamp),
	);
}

export function createWebSocketHistoryList(
	res: WebSocketHistoryListResponse,
): WebSocketHistoryList {
	return new WebSocketHistoryList(
		res.session_id,
		res.messages.map(createWebSocketHistory),
		new Date(res.created_at),
		new Date(res.updated_at),
	);
}

export async function getWebSocketSession(): Promise<WebSocketSession | null> {
	const axiosClient = createAxiosClient();
	const response =
		await axiosClient.get<WebSocketSessionResponse>("/ws/my-session");
	if (!response.data) {
		return null;
	}
	return createWebSocketSession(response.data);
}

export async function getWebSocketHistoryList(): Promise<
	WebSocketHistoryList[]
> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<WebSocketHistoryListResponse[]>(
		"/ws/session-history",
	);
	if (!response.data) {
		return [];
	}
	return response.data.map(createWebSocketHistoryList);
}
