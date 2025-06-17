import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

export class Recipe {
	constructor(
		public id: number,
		public recipeName: string,
		public url: string,
		public status_id: number,
		public externalServiceId: number,
		public createdDate: Date,
		public updatedDate: Date,
	) {}
}

export class ExternalService {
	constructor(
		public id: number,
		public serviceName: string,
		public createdDate: Date,
		public updatedDate: Date,
	) {}
}

export class RecipeStatus {
	constructor(
		public id: number,
		public status: string,
		public createdDate: Date,
		public updatedDate: Date,
	) {}
}

export class RecipeList {
	constructor(
		public items: Recipe[],
		public total: number,
		public page: number,
		public perPage: number,
		public pages: number,
	) {}
}

export class Ingridient {
	constructor(
		public id: number,
		public recipeId: number,
		public ingredient: string,
		public amount: string,
		public createdDate: Date,
		public updatedDate: Date,
	) {}
}

export class Process {
	constructor(
		public id: number,
		public recipeId: number,
		public processNumber: number,
		public process: string,
		public createdDate: Date,
		public updatedDate: Date,
	) {}
}

export interface RecipeResponse {
	id: number;
	recipe_name: string;
	url: string;
	status_id: number;
	external_service_id: number;
	is_favorite: boolean;
	created_date: string; // ISO 8601形式の文字列
	updated_date: string; // ISO 8601形式の文字列
}

export interface ExternalServiceResponse {
	id: number;
	services_name: string;
	created_date: string; // ISO 8601形式の文字列
	updated_date: string; // ISO 8601形式の文字列
}

export interface RecipeStatusResponse {
	id: number;
	status: string;
	created_date: string; // ISO 8601形式の文字列
	updated_date: string; // ISO 8601形式の文字列
}

export interface RecipeListResponse {
	items: RecipeResponse[];
	total: number;
	page: number;
	per_page: number;
	pages: number;
}

export interface IngridientResponse {
	id: number;
	recipe_id: number;
	ingredient: string;
	amount: string;
	created_date: string; // ISO 8601形式の文字列
	updated_date: string; // ISO 8601形式の文字列
}

export interface ProcessResponse {
	id: number;
	recipe_id: number;
	process_number: number;
	process: string;
	created_date: string; // ISO 8601形式の文字列
	updated_date: string; // ISO 8601形式の文字列
}

export interface RecipeQueryParams {
	page: number;
	par_page?: number;
	keyword?: string;
	favorite_only?: boolean;
}

export function createRecipe(res: RecipeResponse): Recipe {
	return new Recipe(
		res.id,
		res.recipe_name,
		res.url,
		res.status_id,
		res.external_service_id,
		new Date(res.created_date),
		new Date(res.updated_date),
	);
}

export function createExternalService(
	res: ExternalServiceResponse,
): ExternalService {
	return new ExternalService(
		res.id,
		res.services_name,
		new Date(res.created_date),
		new Date(res.updated_date),
	);
}

export function createRecipeStatus(res: RecipeStatusResponse): RecipeStatus {
	return new RecipeStatus(
		res.id,
		res.status,
		new Date(res.created_date),
		new Date(res.updated_date),
	);
}

export function createIngridient(res: IngridientResponse): Ingridient {
	return new Ingridient(
		res.id,
		res.recipe_id,
		res.ingredient,
		res.amount,
		new Date(res.created_date),
		new Date(res.updated_date),
	);
}

export function createProcess(res: ProcessResponse): Process {
	return new Process(
		res.id,
		res.recipe_id,
		res.process_number,
		res.process,
		new Date(res.created_date),
		new Date(res.updated_date),
	);
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<RecipeResponse>(`/recipes/${id}`);
	if (!response.data) {
		return null;
	}
	return createRecipe(response.data);
}

export async function getRecipes(
	page: number,
	par_page = 20,
	keyword?: string,
	favorite_only?: boolean,
): Promise<RecipeList> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<RecipeListResponse>(
		`/recipes?page=${page}&par_page=${par_page}&keyword=${keyword || ""}&favorite_only=${favorite_only || false}`,
	);
	return new RecipeList(
		response.data.items.map(createRecipe),
		response.data.total,
		response.data.page,
		response.data.per_page,
		response.data.pages,
	);
}

export async function getExternalServices(): Promise<ExternalService[]> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<ExternalServiceResponse[]>(
		"/recipes/external-services",
	);
	return response.data.map(createExternalService);
}

export async function getRecipeStatuses(): Promise<RecipeStatus[]> {
	const axiosClient = createAxiosClient();
	const response =
		await axiosClient.get<RecipeStatusResponse[]>("/recipes/statuses");
	return response.data.map(createRecipeStatus);
}

export async function getIngridients(recipeId: number): Promise<Ingridient[]> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<IngridientResponse[]>(
		`/recipes/${recipeId}/ingredients`,
	);
	return response.data.map(createIngridient);
}

export async function getProcesses(recipeId: number): Promise<Process[]> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<ProcessResponse[]>(
		`/recipes/${recipeId}/processes`,
	);
	return response.data.map(createProcess);
}
