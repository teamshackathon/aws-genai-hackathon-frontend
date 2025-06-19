import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

export class ShoppingListList {
	constructor(
		public items: ShoppingList[],
		public total: number,
		public page: number,
		public perPage: number,
		public pages: number,
	) {}
}

export class ShoppingList {
	constructor(
		public id: number, // 買い物リストのID (UUIDを想定)
		public recipeId: number, // 関連するレシピのID (存在しない場合もあるためオプション)
		public listName: string,
		public listId: string, // 買い物リストのアイテム
		public createdAt: string, // 作成日時 (ISO 8601形式)
		public updatedAt: string, // 更新日時 (ISO 8601形式)
	) {}
}

export class ShoppingListItem {
	constructor(
		public id: number, // アイテムのID
		public ingredientId: number, // ingredients テーブルのID
		public isChecked: boolean, // チェック状態
		public createdAt: string, // 作成日時 (ISO 8601形式)
		public updatedAt: string, // 更新日時 (ISO 8601形式)
	) {}
}

export interface ShoppingListListResponse {
	items: ShoppingListResponse[];
	total: number;
	page: number;
	per_page: number;
	pages: number;
}

export interface ShoppingListResponse {
	id: number;
	recipe_id: number; // レシピID
	list_name: string; // 買い物リストの名前
	list_id: string; // 買い物リストのID (UUIDを想定)
	created_at: string; // 作成日時 (ISO 8601形式)
	updated_at: string; // 更新日時 (ISO 8601形式)
}

export interface ShoppingListItemResponse {
	id: number; // アイテムのID
	ingredient_id: number; // ingredients テーブルのID
	is_checked: boolean; // チェック状態
	created_at: string; // 作成日時 (ISO 8601形式)
	updated_at: string; // 更新日時 (ISO 8601形式)
}

export interface ShoppingListCreateRequest {
	recipe_id: number; // レシピID
}

export interface UpdateShoppingListItemRequest {
	is_checked: boolean; // チェック状態
}

export interface ShoppingListQueryParams {
	page: number;
	per_page: number;
	keyword?: string;
}

export function createShoppingList(res: ShoppingListResponse) {
	return new ShoppingList(
		res.id, // IDを文字列に変換
		res.recipe_id,
		res.list_name,
		res.list_id,
		res.created_at,
		res.updated_at,
	);
}

export function createShoppingListList(
	res: ShoppingListListResponse,
): ShoppingListList {
	const items = res.items.map(createShoppingList);
	return new ShoppingListList(
		items,
		res.total,
		res.page,
		res.per_page,
		res.pages,
	);
}

export function createShoppingListItem(
	res: ShoppingListItemResponse,
): ShoppingListItem {
	return new ShoppingListItem(
		res.id, // IDを文字列に変換
		res.ingredient_id,
		res.is_checked,
		res.created_at,
		res.updated_at,
	);
}

// ----------------------------------------------------
// API呼び出し関数
// ----------------------------------------------------

// 新しい買い物リストを作成するAPI呼び出し関数
export async function postShoppingList(
	recipeId: number,
): Promise<ShoppingList> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.post<
			ShoppingListCreateRequest,
			ShoppingListResponse
		>("/shopping-lists", {
			recipe_id: recipeId,
		});
		return createShoppingList(response.data);
	} catch (error) {
		console.error("Error creating shopping list:", error);
		throw error;
	}
}

export async function getShoppingList(
	shoppingListId: number,
): Promise<ShoppingList> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.get<ShoppingListResponse>(
			`/shopping-lists/${shoppingListId}`,
		);
		return createShoppingList(response.data);
	} catch (error) {
		console.error("Error fetching shopping lists:", error);
		throw error;
	}
}

// ユーザーの買い物リスト一覧を取得するAPI呼び出し関数
export async function getShoppingLists(
	page: number,
	par_page: number,
	keyword?: string,
): Promise<ShoppingListList> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.get<ShoppingListListResponse>(
			`/shopping-lists?page=${page}&par_page=${par_page}&keyword=${keyword}`,
		);
		return createShoppingListList(response.data);
	} catch (error) {
		console.error("Error fetching shopping lists:", error);
		throw error;
	}
}

export async function getShoppingListItems(
	shoppingListId: string,
): Promise<ShoppingListItem[]> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.get<ShoppingListItemResponse[]>(
			`/shopping-lists/${shoppingListId}/items`,
		);
		return response.data.map(createShoppingListItem);
	} catch (error) {
		console.error(
			`Error fetching shopping list detail for ${shoppingListId}:`,
			error,
		);
		throw error;
	}
}

export async function updateShoppingListItem(
	shoppingListItemId: string,
	data: UpdateShoppingListItemRequest,
): Promise<ShoppingListItem> {
	const axiosClient = createAxiosClient();
	try {
		const response = await axiosClient.put<
			UpdateShoppingListItemRequest,
			ShoppingListItemResponse
		>(`/shopping-lists/item/${shoppingListItemId}`, data);
		return createShoppingListItem(response.data);
	} catch (error) {
		console.error(
			`Error updating shopping list item ${shoppingListItemId}`,
			error,
		);
		throw error;
	}
}
