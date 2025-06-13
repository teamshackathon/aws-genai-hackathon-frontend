import { type RecipeQueryParams, getRecipes } from "@/lib/domain/RecipeQuery";
import { atom } from "jotai";

import { atomWithRefresh, loadable } from "jotai/utils";

const recipeQueryParamAtom = atom<RecipeQueryParams>({
	page: 1,
	par_page: 20,
	keyword: "",
	favorite_only: false,
});

export const recipeListAtomAsync = atomWithRefresh(async (get) => {
	const params = get(recipeQueryParamAtom);
	return await getRecipes(
		params.page,
		params.par_page,
		params.keyword,
		params.favorite_only,
	);
});

export const recipeListAtomLoadable = loadable(recipeListAtomAsync);
