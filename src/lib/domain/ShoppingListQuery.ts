import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

// 買い物リスト一覧の各アイテムの型
export type ShoppingListSummary = {
	id: string; // 買い物リストのID (UUIDを想定)
	listName: string; // リスト名 (例: "ワンタンスープ 買い物リスト (2025/06/17)")
	recipeId?: number; // 関連するレシピのID (存在しない場合もあるためオプション)
	recipeName?: string; // 関連するレシピ名 (存在しない場合もあるためオプション)
	createdAt: string; // 作成日時 (ISO 8601形式の文字列)
	updatedAt: string; // 更新日時 (ISO 8601形式の文字列)
};

// 買い物リスト一覧APIのレスポンス型
export type GetShoppingListsResponse = ShoppingListSummary[];

// 買い物リストアイテムの型
export type ShoppingListItem = {
	id: string; // shopping_list_items テーブルのID (UUIDを想定)
	ingredientId: number; // ingredients テーブルのID
	ingredientName: string; // 材料名
	amount: string; // 分量
	isChecked: boolean; // チェック状態
	// quantity?: string; // もしDBにquantityカラムを設けるなら追加
};

// 個別の買い物リスト詳細の型
export type ShoppingListDetail = {
	id: string; // shopping_lists テーブルのID (UUIDを想定)
	listName: string;
	recipeId?: number;
	recipeName?: string;
	createdAt: string;
	updatedAt: string;
	items: ShoppingListItem[]; // このリストに含まれるアイテム
};

// 買い物リストアイテムのチェック状態更新APIのリクエスト/レスポンス型
export type UpdateShoppingListItemRequest = {
	isChecked: boolean;
};

export type UpdateShoppingListItemResponse = {
	id: string; // 更新されたアイテムのID
	isChecked: boolean; // 更新後のチェック状態
	message: string;
};

// 新しい買い物リスト作成APIのレスポンス型
export type CreateShoppingListResponse = {
	shoppingListId: string; // バックエンドから返される買い物リストのID (UUIDを想定)
	message: string;
};

// ----------------------------------------------------
// API呼び出し関数
// ----------------------------------------------------

// 新しい買い物リストを作成するAPI呼び出し関数
export async function createShoppingList(
	recipeId: number,
	userId: string, // <-- このuserIdはコンポーネントから渡されることを想定
	recipeName: string,
): Promise<CreateShoppingListResponse> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.post<CreateShoppingListResponse>(
			"/shopping-lists",
			{
				recipeId: recipeId,
				userId: userId, // バックエンドで認証トークンからユーザーIDを抽出するなら、このuserIdは不要になる
				listName: `${recipeName} 買い物リスト (${new Date().toLocaleDateString()})`,
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error creating shopping list:", error);
		throw error;
	}
}

// ユーザーの買い物リスト一覧を取得するAPI呼び出し関数
export async function getShoppingLists(
	userId: string, // <-- このuserIdはコンポーネントから渡されることを想定
): Promise<GetShoppingListsResponse> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.get<GetShoppingListsResponse>(
			`/shopping-lists?userId=${userId}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching shopping lists:", error);
		throw error;
	}
}

export async function getShoppingListDetail(
	shoppingListId: string,
	userId: string, // <-- このuserIdはコンポーネントから渡されることを想定
): Promise<ShoppingListDetail> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.get<ShoppingListDetail>(
			`/shopping-lists/${shoppingListId}?userId=${userId}`,
		);
		return response.data;
	} catch (error) {
		console.error(
			`Error fetching shopping list detail for ${shoppingListId}:`,
			error,
		);
		throw error;
	}
}

export async function updateShoppingListItem(
	shoppingListId: string,
	shoppingListItemId: string,
	data: UpdateShoppingListItemRequest,
	userId: string, // <-- このuserIdはコンポーネントから渡されることを想定
): Promise<UpdateShoppingListItemResponse> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.put<UpdateShoppingListItemResponse>(
			`/shopping-lists/${shoppingListId}/items/${shoppingListItemId}?userId=${userId}`,
			data,
		);
		return response.data;
	} catch (error) {
		console.error(
			`Error updating shopping list item ${shoppingListItemId} for list ${shoppingListId}:`,
			error,
		);
		throw error;
	}
}
