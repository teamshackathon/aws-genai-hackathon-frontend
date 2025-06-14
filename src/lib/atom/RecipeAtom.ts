import {
	type ExternalService,
	type RecipeList,
	type RecipeQueryParams,
	type RecipeStatus,
	getExternalServices,
	getRecipeStatuses,
	getRecipes,
} from "@/lib/domain/RecipeQuery";
import { atom } from "jotai";

import { atomWithRefresh, atomWithReset, loadable } from "jotai/utils";

export const recipeUrlAtom = atomWithReset<string>("");

const recipeQueryParamAtom = atom<RecipeQueryParams>({
	page: 1,
	par_page: 20,
	keyword: "",
	favorite_only: false,
});

export const recipeListAtomAsync = atomWithRefresh<Promise<RecipeList | null>>(
	async (get) => {
		const params = get(recipeQueryParamAtom);
		try {
			return await getRecipes(
				params.page,
				params.par_page,
				params.keyword,
				params.favorite_only,
			);
		} catch (error) {
			console.error("Error fetching recipe list:", error);
			return null;
		}
	},
);

export const externalServiceAtomAsync = atomWithRefresh<
	Promise<ExternalService[]>
>(async () => {
	try {
		return await getExternalServices();
	} catch (error) {
		console.error("Error fetching external services:", error);
		return [];
	}
});

export const recipeStatusAtomAsync = atomWithRefresh<Promise<RecipeStatus[]>>(
	async () => {
		try {
			return await getRecipeStatuses();
		} catch (error) {
			console.error("Error fetching recipe statuses:", error);
			return [];
		}
	},
);

export const recipeListAtomLoadable = loadable(recipeListAtomAsync);
export const externalServiceAtomLoadable = loadable(externalServiceAtomAsync);
export const recipeStatusAtomLoadable = loadable(recipeStatusAtomAsync);
