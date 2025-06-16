import {
	type User,
	type UserRecipeRequest,
	type UserUpdateRequest,
	getUser,
	updateUser,
	updateUserRecipe,
} from "@/lib/domain/UserQuery";
import { atom } from "jotai";
import { recipeListAtomAsync } from "./RecipeAtom";

export const userAtom = atom<User | null | undefined>(undefined);

export const isUserLoadingAtom = atom<boolean>(false);

// write only atom
// ユーザー情報を取得するためのatom
export const getUserAtom = atom(null, async (_, set) => {
	set(isUserLoadingAtom, true);
	try {
		const res = await getUser();
		set(userAtom, res);
	} catch (error) {
		console.error("Failed to fetch user data:", error);
	} finally {
		set(isUserLoadingAtom, false);
	}
});

export const updateUserAtom = atom(
	null,
	async (_, set, user: UserUpdateRequest) => {
		set(isUserLoadingAtom, true);
		try {
			const updatedUser = await updateUser(user);
			set(userAtom, updatedUser);
		} catch (error) {
			console.error("Failed to update user data:", error);
		} finally {
			set(isUserLoadingAtom, false);
		}
	},
);

export const updateUserRecipeAtom = atom(
	null,
	async (_, set, recipeId: number, userRecipe: UserRecipeRequest) => {
		try {
			await updateUserRecipe(recipeId, userRecipe);
			set(recipeListAtomAsync);
		} catch (error) {
			console.error("Failed to update user recipe:", error);
		}
	},
);
