export interface WebSocketOptions {
	onMessage?: (message: MessageEvent) => void;
	reconnectAttempts?: number;
	reconnectInterval?: number;
}
