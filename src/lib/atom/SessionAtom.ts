import {
	getWebSocketHistoryList,
	getWebSocketSession,
} from "@/lib/domain/SessionQuery";

import { atomWithRefresh, loadable } from "jotai/utils";

export const sessionAtomAsync = atomWithRefresh(async () => {
	try {
		const session = await getWebSocketSession();
		return session;
	} catch (error) {
		console.error("Error fetching WebSocket session:", error);
		return null;
	}
});

export const sessionHistoryListAtomAsync = atomWithRefresh(async () => {
	try {
		const historyList = await getWebSocketHistoryList();
		return historyList;
	} catch (error) {
		console.error("Error fetching WebSocket history list:", error);
		return null;
	}
});

export const sessionAtomLoadable = loadable(sessionAtomAsync);
export const sessionHistoryListAtomLoadable = loadable(
	sessionHistoryListAtomAsync,
);
