import {
	type ExternalService,
	type Ingridient,
	type Process,
	type Recipe,
	type RecipeList,
	type RecipeQueryParams,
	type RecipeSortParams,
	type RecipeStatus,
	createIngredient,
	deleteIngredient,
	deleteProcess,
	getExternalServices,
	getIngridients,
	getProcesses,
	getRecipeById,
	getRecipeStatuses,
	getRecipes,
	postProcess,
	updateIngredient,
	updateProcess,
} from "@/lib/domain/RecipeQuery";
import { atom } from "jotai";

import { atomWithRefresh, atomWithReset, loadable } from "jotai/utils";

export const recipeUrlAtom = atomWithReset<string>("");
export const ingredientsAtom = atomWithReset<Ingridient[]>([]);
export const processesAtom = atomWithReset<Process[]>([]);
export const currentRecipeAtom = atomWithReset<Recipe | null | undefined>(
	undefined,
);

export const recipeQueryParamAtom = atom<RecipeQueryParams>({
	page: 1,
	per_page: 20,
	keyword: "",
	favorite_only: false,
});

export const recipeSortParamAtom = atom<RecipeSortParams>({
	sorted_by: null,
	order_by: null,
});

export const recipeListAtomAsync = atomWithRefresh<Promise<RecipeList | null>>(
	async (get) => {
		const params = get(recipeQueryParamAtom);
		const sortParams = get(recipeSortParamAtom);
		try {
			return await getRecipes(
				params.page,
				params.per_page,
				params.keyword,
				params.favorite_only,
				sortParams.sorted_by,
				sortParams.order_by,
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

export const createIngredientAtom = atom(
	null,
	async (_, __, recipeId: number, ingredient: string, amount: string) => {
		const newIngredient = await createIngredient(recipeId, {
			recipeId,
			ingredient,
			amount,
		});
		return newIngredient;
	},
);

export const updateIngredientAtom = atom(
	null,
	async (_, __, ingredientId: number, ingredient: string, amount: string) => {
		const updatedIngredient = await updateIngredient(ingredientId, {
			ingredient,
			amount,
		});
		return updatedIngredient;
	},
);

export const deleteIngredientAtom = atom(
	null,
	async (_, __, ingredientId: number) => {
		try {
			await deleteIngredient(ingredientId);
		} catch (error) {
			console.error("Error deleting ingredient:", error);
		}
	},
);

export const createProcessAtom = atom(
	null,
	async (_, __, recipeId: number, process_number: number, process: string) => {
		const newProcess = await postProcess(recipeId, {
			process_number,
			process,
		});
		return newProcess;
	},
);

export const updateProcessAtom = atom(
	null,
	async (_, __, processId: number, process_number: number, process: string) => {
		const updatedProcess = await updateProcess(processId, {
			process_number,
			process,
		});
		return updatedProcess;
	},
);

export const deleteProcessAtom = atom(
	null,
	async (_, __, processId: number) => {
		try {
			await deleteProcess(processId);
		} catch (error) {
			console.error("Error deleting process:", error);
		}
	},
);
