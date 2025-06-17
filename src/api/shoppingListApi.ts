// src/api/shoppingListApi.ts
import type { CreateShoppingListResponse } from "@/lib/domain/RecipeQuery";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"; // 環境変数からバックエンドのURLを取得

// 新しい買い物リストを作成するAPI呼び出し関数
export const createShoppingList = async (
	recipeId: number,
	userId: string, // ユーザーIDを引数で受け取る
	recipeName: string, // リスト名生成のためにレシピ名も受け取る
): Promise<CreateShoppingListResponse> => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/shopping-lists`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// TODO: 認証トークンをヘッダーに含める (例: "Authorization": `Bearer ${token}`)
			},
			body: JSON.stringify({
				recipeId: recipeId,
				userId: userId,
				listName: `${recipeName} 買い物リスト (${new Date().toLocaleDateString()})`, // 例: "ワンタンスープ 買い物リスト (2025/06/17)"
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.message || "買い物リストの作成に失敗しました。",
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating shopping list:", error);
		throw error;
	}
};
