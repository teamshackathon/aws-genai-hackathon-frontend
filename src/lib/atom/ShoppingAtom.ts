import { atom } from "jotai";

import { atomWithRefresh, atomWithReset, loadable } from "jotai/utils";
import {
	type ShoppingItem,
	type ShoppingList,
	type ShoppingListQueryParams,
	type UpdateShoppingItemRequest,
	getShoppingItems,
	getShoppingList,
	postShopping,
	updateShoppingItem,
} from "../domain/ShoppingListQuery";

export const shoppingListQueryParamAtom =
	atomWithReset<ShoppingListQueryParams>({
		page: 1,
		per_page: 20,
		keyword: "",
	});
export const shoppingItemsAtom = atomWithReset<ShoppingItem[]>([]);

export const shoppingListAtomAsync = atomWithRefresh<
	Promise<ShoppingList | null>
>(async (get) => {
	const params = get(shoppingListQueryParamAtom);
	try {
		// ここでAPI呼び出しを行い、買い物リストを取得する
		return await getShoppingList(params.page, params.per_page, params.keyword);
	} catch (error) {
		console.error("Error fetching shopping list:", error);
		return null;
	}
});

export const shoppingListAtomLoadable = loadable(shoppingListAtomAsync);

export const getShoppingItemsAtom = atom(
	null,
	async (_, set, shoppingListId: string) => {
		try {
			const items = await getShoppingItems(shoppingListId);
			set(shoppingItemsAtom, items);
		} catch (error) {
			console.error(
				`Error fetching shopping list items for ${shoppingListId}:`,
				error,
			);
		}
	},
);

export const postShoppingAtom = atom(null, async (_, __, recipeId: number) => {
	try {
		const shopping = await postShopping(recipeId);
		return shopping;
	} catch (error) {
		console.error("Error creating shopping list:", error);
		throw error; // エラーを再スローして上位でハンドリングできるようにする
	}
});

export const updatedShoppingItemAtom = atom(
	null,
	async (_, __, shoppingItemId: string, data: UpdateShoppingItemRequest) => {
		try {
			const updatedItems = await updateShoppingItem(shoppingItemId, data);
			return updatedItems;
		} catch (error) {
			console.error(
				`Error updating shopping list item for ${shoppingItemId}:`,
				error,
			);
			throw error; // エラーを再スローして上位でハンドリングできるようにする
		}
	},
);
