import { getCookHistory, postCookHistory } from "@/lib/domain/CookQuery";
import { atom } from "jotai";

export const getCookHistoryAtom = atom(
	null,
	async (_, __, recipeId: number) => {
		try {
			const response = await getCookHistory(recipeId);
			return response;
		} catch (error) {
			console.error("Failed to fetch cook history:", error);
			throw error; // エラーを再スローして上位でハンドリングできるようにする
		}
	},
);

export const postCookHistoryAtom = atom(
	null,
	async (_, __, recipeId: number) => {
		try {
			const response = await postCookHistory({
				recipe_id: recipeId,
			});
			return response;
		} catch (error) {
			console.error("Failed to post cook history:", error);
			throw error; // エラーを再スローして上位でハンドリングできるようにする
		}
	},
);
