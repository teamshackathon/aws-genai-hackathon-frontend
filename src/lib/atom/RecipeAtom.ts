import {
	type ExternalService,
	type Ingridient,
	type Process,
	type Recipe,
	type RecipeList,
	type RecipeQueryParams,
	type RecipeStatus,
	getExternalServices,
	getIngridients,
	getProcesses,
	getRecipeById,
	getRecipeStatuses,
	getRecipes,
} from "@/lib/domain/RecipeQuery";
import { atom } from "jotai";

import { atomWithRefresh, atomWithReset, loadable } from "jotai/utils";

export const recipeUrlAtom = atomWithReset<string>("");
export const ingredientsAtom = atomWithReset<Ingridient[]>([]);
export const processesAtom = atomWithReset<Process[]>([]);
export const currentRecipeAtom = atomWithReset<Recipe | null>(null);

export const recipeQueryParamAtom = atom<RecipeQueryParams>({
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

export const getIngridientsAtom = atom(
	null,
	async (_, set, recipeId: number) => {
		try {
			const ingredients = await getIngridients(recipeId);
			set(ingredientsAtom, ingredients);
		} catch (error) {
			console.error("Error fetching ingredients:", error);
			set(ingredientsAtom, []);
		}
	},
);

export const getProcessesAtom = atom(null, async (_, set, recipeId: number) => {
	try {
		const processes = await getProcesses(recipeId);
		set(processesAtom, processes);
	} catch (error) {
		console.error("Error fetching processes:", error);
		set(processesAtom, []);
	}
});

export const getRecipeByIdAtom = atom(
	null,
	async (_, set, recipeId: number) => {
		try {
			const recipe = await getRecipeById(recipeId);
			set(currentRecipeAtom, recipe);
		} catch (error) {
			console.error("Error fetching recipe by ID:", error);
			set(currentRecipeAtom, null);
		}
	},
);

export const refreshRecipeListAtom = atom(null, async (_, set) => {
	try {
		set(recipeListAtomAsync);
	} catch (error) {
		console.error("Error refreshing recipe list:", error);
	}
});
