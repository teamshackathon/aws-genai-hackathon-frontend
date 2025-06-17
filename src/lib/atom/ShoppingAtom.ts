import { atom } from "jotai";

import { atomWithRefresh, atomWithReset, loadable } from "jotai/utils";
import {
	type ShoppingListItem,
	type ShoppingListList,
	type ShoppingListQueryParams,
	type UpdateShoppingListItemRequest,
	getShoppingListItems,
	getShoppingLists,
	postShoppingList,
	updateShoppingListItem,
} from "../domain/ShoppingListQuery";

export const shoppingListQueryParamAtom =
	atomWithReset<ShoppingListQueryParams>({
		page: 1,
		par_page: 20,
		keyword: "",
	});
export const shoppingListItemsAtom = atomWithReset<ShoppingListItem[]>([]);

export const shoppingListAtomAsync = atomWithRefresh<
	Promise<ShoppingListList | null>
>(async (get) => {
	const params = get(shoppingListQueryParamAtom);
	try {
		// ここでAPI呼び出しを行い、買い物リストを取得する
		return await getShoppingLists(params.page, params.par_page, params.keyword);
	} catch (error) {
		console.error("Error fetching shopping list:", error);
		return null;
	}
});

export const shoppingListAtomLoadable = loadable(shoppingListAtomAsync);

export const getShoppingListItemsAtom = atom(
	null,
	async (_, set, shoppingListId: string) => {
		try {
			const items = await getShoppingListItems(shoppingListId);
			set(shoppingListItemsAtom, items);
		} catch (error) {
			console.error(
				`Error fetching shopping list items for ${shoppingListId}:`,
				error,
			);
		}
	},
);

export const postShoppingListAtom = atom(
	null,
	async (_, __, recipeId: number) => {
		try {
			const shoppingList = await postShoppingList(recipeId);
			return shoppingList;
		} catch (error) {
			console.error("Error creating shopping list:", error);
			throw error; // エラーを再スローして上位でハンドリングできるようにする
		}
	},
);

export const updatedShoppingListItemAtom = atom(
	null,
	async (
		_,
		__,
		shoppingListId: string,
		data: UpdateShoppingListItemRequest,
	) => {
		try {
			const updatedItems = await updateShoppingListItem(shoppingListId, data);
			return updatedItems;
		} catch (error) {
			console.error(
				`Error updating shopping list item for ${shoppingListId}:`,
				error,
			);
			throw error; // エラーを再スローして上位でハンドリングできるようにする
		}
	},
);
