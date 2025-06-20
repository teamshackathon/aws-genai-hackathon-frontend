import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

export class ShoppingList {
	constructor(
		public items: Shopping[],
		public total: number,
		public page: number,
		public perPage: number,
		public pages: number,
	) {}
}

export class Shopping {
	constructor(
		public id: number, // 買い物リストのID (UUIDを想定)
		public recipeId: number, // 関連するレシピのID (存在しない場合もあるためオプション)
		public listName: string,
		public createdAt: string, // 作成日時 (ISO 8601形式)
		public updatedAt: string, // 更新日時 (ISO 8601形式)
	) {}
}

export class ShoppingItem {
	constructor(
		public id: number, // アイテムのID
		public ingredient: string, // ingredients テーブルのID]
		public amount: string, // アイテムの量
		public isChecked: boolean, // チェック状態
		public createdAt: string, // 作成日時 (ISO 8601形式)
		public updatedAt: string, // 更新日時 (ISO 8601形式)
	) {}
}

export interface ShoppingListResponse {
	items: ShoppingResponse[];
	total: number;
	page: number;
	per_page: number;
	pages: number;
}

export interface ShoppingResponse {
	id: number;
	recipe_id: number; // レシピID
	list_name: string; // 買い物リストの名前
	created_date: string; // 作成日時 (ISO 8601形式)
	updated_date: string; // 更新日時 (ISO 8601形式)
}

export interface ShoppingItemResponse {
	id: number; // アイテムのID
	ingredient: string;
	amount: string; // アイテムの量
	is_checked: boolean; // チェック状態
	created_date: string; // 作成日時 (ISO 8601形式)
	updated_date: string; // 更新日時 (ISO 8601形式)
}

export interface ShoppingCreateRequest {
	recipe_id: number; // レシピID
}

export interface UpdateShoppingItemRequest {
	is_checked: boolean; // チェック状態
}

export interface ShoppingListQueryParams {
	page: number;
	per_page: number;
	keyword?: string;
}

export function createShopping(res: ShoppingResponse) {
	return new Shopping(
		res.id, // IDを文字列に変換
		res.recipe_id,
		res.list_name,
		res.created_date,
		res.updated_date,
	);
}

export function createShoppingList(res: ShoppingListResponse): ShoppingList {
	const items = res.items.map(createShopping);
	return new ShoppingList(items, res.total, res.page, res.per_page, res.pages);
}

export function createShoppingItem(res: ShoppingItemResponse): ShoppingItem {
	return new ShoppingItem(
		res.id, // IDを文字列に変換
		res.ingredient,
		res.amount,
		res.is_checked,
		res.created_date,
		res.updated_date,
	);
}

// ----------------------------------------------------
// API呼び出し関数
// ----------------------------------------------------

// 新しい買い物リストを作成するAPI呼び出し関数
export async function postShopping(recipeId: number): Promise<Shopping> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.post<
			ShoppingCreateRequest,
			ShoppingResponse
		>("/shopping-lists", {
			recipe_id: recipeId,
		});
		return createShopping(response.data);
	} catch (error) {
		console.error("Error creating shopping list:", error);
		throw error;
	}
}

export async function getShopping(shoppingListId: number): Promise<Shopping> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.get<ShoppingResponse>(
			`/shopping-lists/${shoppingListId}`,
		);
		return createShopping(response.data);
	} catch (error) {
		console.error("Error fetching shopping lists:", error);
		throw error;
	}
}

// ユーザーの買い物リスト一覧を取得するAPI呼び出し関数
export async function getShoppingList(
	page: number,
	per_page: number,
	keyword?: string,
): Promise<ShoppingList> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.get<ShoppingListResponse>(
			`/shopping-lists?page=${page}&per_page=${per_page}&keyword=${keyword}`,
		);
		return createShoppingList(response.data);
	} catch (error) {
		console.error("Error fetching shopping lists:", error);
		throw error;
	}
}

export async function getShoppingItems(
	shoppingListId: string,
): Promise<ShoppingItem[]> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.get<ShoppingItemResponse[]>(
			`/shopping-lists/${shoppingListId}/items`,
		);
		return response.data.map(createShoppingItem);
	} catch (error) {
		console.error(
			`Error fetching shopping list detail for ${shoppingListId}:`,
			error,
		);
		throw error;
	}
}

export async function updateShoppingItem(
	shoppingListItemId: string,
	data: UpdateShoppingItemRequest,
): Promise<ShoppingItem> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.put<
			UpdateShoppingItemRequest,
			ShoppingItemResponse
		>(`/shopping-lists/item/${shoppingListItemId}`, data);
		return createShoppingItem(response.data);
	} catch (error) {
		console.error(
			`Error updating shopping list item ${shoppingListItemId}`,
			error,
		);
		throw error;
	}
}
