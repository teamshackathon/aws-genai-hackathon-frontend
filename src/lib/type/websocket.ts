import type { RecipeParameters } from "./RecipeParameters";

export interface WebSocketOptions {
	onMessage?: (message: MessageEvent) => void;
	reconnectAttempts?: number;
	reconnectInterval?: number;
	shouldConnect?: boolean;
	recipeParams?: RecipeParameters | null;
}

export class WebSocketMessage {
	constructor(
		public type: string,
		public data: any,
		public timestamp: Date,
		public sessionId: string,
	) {}
}

export class WebSocketHistory {
	constructor(
		public messageType: string,
		public messageId: string,
		public content: string,
		public metadata: Record<string, any>,
		public timestamp: Date,
	) {}
}

export class WebSocketHistoryList {
	constructor(
		public sessionId: string,
		public messages: WebSocketHistory[],
		public createdAt: Date,
		public updatedAt: Date,
	) {}
}

export interface WebSocketResponse {
	type: string;
	data: any;
	timestamp: string; // ISO 8601形式の文字列
	session_id: string;
}

export interface WebSocketHistoryListResponse {
	session_id: string;
	messages: WebSocketHistoryResponse[];
	created_at: string; // ISO 8601形式の文字列
	updated_at: string; // ISO 8601形式の文字列
}

export interface WebSocketHistoryResponse {
	message_type: string;
	message_id: string;
	content: string;
	metadata: Record<string, any>;
	timestamp: string; // ISO 8601形式の文字列
}
