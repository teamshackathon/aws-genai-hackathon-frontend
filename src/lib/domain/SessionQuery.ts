import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

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

export async function getWebSocketSession(): Promise<WebSocketSession | null> {
	const axiosClient = createAxiosClient();
	const response =
		await axiosClient.get<WebSocketSessionResponse>("/ws/my-session");
	if (!response.data) {
		return null;
	}
	return createWebSocketSession(response.data);
}
