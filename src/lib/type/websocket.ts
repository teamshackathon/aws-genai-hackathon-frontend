export interface WebSocketOptions {
	onMessage?: (message: MessageEvent) => void;
	reconnectAttempts?: number;
	reconnectInterval?: number;
	shouldConnect?: boolean;
}

export class WebSocketMessage {
	constructor(
		public type: string,
		public data: any,
		public timestamp: Date,
		public sessionId: string,
	) {}
}

export interface WebSocketResponse {
	type: string;
	data: any;
	timestamp: string; // ISO 8601形式の文字列
	session_id: string;
}
