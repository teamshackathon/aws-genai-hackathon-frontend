import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

export class Recipe {
	constructor(
		public id: number,
		public recipeName: string,
		public url: string,
		public status_id: number,
		public externalServiceId: number,
		public keyword: string,
		public genrue: string,
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
	keyword: string;
	genrue: string;
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
	per_page?: number;
	keyword?: string;
	favorite_only?: boolean;
}

export interface RecipeSortParams {
	sorted_by: "created_date" | "updated_date" | "recipe_name" | "rating" | null;
	order_by: "asc" | "desc" | null;
}

export interface IngredientRequest {
	recipeId?: number;
	ingredient?: string;
	amount?: string;
}

export interface ProcessRequest {
	recipeId?: number;
	process_number?: number;
	process?: string;
}

export function createRecipe(res: RecipeResponse): Recipe {
	return new Recipe(
		res.id,
		res.recipe_name,
		res.url,
		res.status_id,
		res.external_service_id,
		res.keyword,
		res.genrue,
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
	per_page = 20,
	keyword?: string,
	favorite_only?: boolean,
	sorted_by?: "created_date" | "updated_date" | "recipe_name" | "rating" | null,
	order_by?: "asc" | "desc" | null,
): Promise<RecipeList> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<RecipeListResponse>(
		`/recipes?page=${page}&per_page=${per_page}&keyword=${keyword || ""}&favorites_only=${favorite_only || false}&sorted_by=${sorted_by || ""}&order_by=${order_by || ""}`,
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

export async function createIngredient(
	recipeId: number,
	request: IngredientRequest,
): Promise<Ingridient> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.post<
		IngredientRequest,
		IngridientResponse
	>(`/recipes/${recipeId}/ingredient`, request);
	return createIngridient(response.data);
}

export async function updateIngredient(
	ingredientId: number,
	request: IngredientRequest,
) {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.put<IngredientRequest, IngridientResponse>(
		`/recipes/ingredient/${ingredientId}`,
		request,
	);
	return createIngridient(response.data);
}

export async function deleteIngredient(ingredientId: number): Promise<void> {
	const axiosClient = createAxiosClient();
	await axiosClient.delete(`/recipes/ingredient/${ingredientId}`);
}

export async function getProcesses(recipeId: number): Promise<Process[]> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<ProcessResponse[]>(
		`/recipes/${recipeId}/processes`,
	);
	return response.data.map(createProcess);
}

export async function postProcess(
	recipeId: number,
	request: ProcessRequest,
): Promise<Process> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.post<ProcessRequest, ProcessResponse>(
		`/recipes/${recipeId}/process`,
		request,
	);
	return createProcess(response.data);
}

export async function updateProcess(
	processId: number,
	request: ProcessRequest,
): Promise<Process> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.put<ProcessRequest, ProcessResponse>(
		`/recipes/process/${processId}`,
		request,
	);
	return createProcess(response.data);
}

export async function deleteProcess(processId: number): Promise<void> {
	const axiosClient = createAxiosClient();
	await axiosClient.delete(`/recipes/process/${processId}`);
}
