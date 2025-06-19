import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

export class User {
	constructor(
		public id: number,
		public name: string,
		public email: string,
		public avatarUrl: string,
		public lastLoginAt: Date | null,
		public bio?: string, // ユーザーの自己紹介やプロフィール情報
	) {}
}

export class UserRecipe {
	constructor(
		public id: number, // ユーザーのレシピID
		public userId: number, // ユーザーID
		public recipeId: number,
		public isFavorite: boolean, // レシピのお気に入り状態
		public note: string | null, // レシピに対するユーザーのメモやコメント
		public rating: number | null, // レシピの評価（1〜5の範囲）
		public createdAt: Date, // 作成日時
		public updatedAt: Date, // 更新日時
	) {}
}

export interface UserResponse {
	id: number;
	name: string | null;
	email: string;
	avatar_url?: string | null;
	last_login_at?: string | null; // ISO 8601形式の文字列
	bio?: string | null; // ユーザーの自己紹介やプロフィール情報
}

export interface UserRecipeResponse {
	id: number; // ユーザーのレシピID
	user_id: number; // ユーザーID
	recipe_id: number; // レシピID
	is_favorite: boolean; // レシピのお気に入り状態
	note: string | null; // レシピに対するユーザーのメモやコメント
	rating: number | null; // レシピの評価（1〜5の範囲）
	created_date: string; // 作成日時 (ISO 8601形式)
	updated_date: string; // 更新日時 (ISO 8601形式)
}

export interface UserCreateRequest {
	name: string;
	email: string;
	password: string;
}

export interface UserUpdateRequest {
	name?: string | null;
	email?: string;
	password?: string;
	avatar_url?: string | null;
	last_login_at?: string | null;
	bio?: string | null;
}

export interface UserRecipeRequest {
	is_favorite?: boolean; // レシピのお気に入り状態
	note?: string; // レシピに対するユーザーのメモやコメント
	rating?: number; // レシピの評価（1〜5の範囲）
}

function createUser(res: UserResponse): User {
	return new User(
		res.id,
		res.name || "No Name", // 名前がnullの場合はデフォルト値を設定
		res.email || "No Email", // メールアドレスがnullの場合はデフォルト値を設定
		res.avatar_url || "", // アバターURLがnullの場合はnullを設定
		res.last_login_at ? new Date(res.last_login_at) : null,
		res.bio || "", // ユーザーの自己紹介やプロフィール情報
	);
}

function createUserRecipe(res: UserRecipeResponse): UserRecipe {
	return new UserRecipe(
		res.id,
		res.user_id,
		res.recipe_id,
		res.is_favorite,
		res.note, // レシピに対するユーザーのメモやコメント
		res.rating, // レシピの評価（デフォルトは0）
		new Date(res.created_date),
		new Date(res.updated_date),
	);
}

export async function getUser(): Promise<User> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<UserResponse>("/users/me");
	return createUser(response.data);
}

export async function updateUser(request: UserUpdateRequest): Promise<User> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.put<UserUpdateRequest, UserResponse>(
		"/users/me",
		request,
	);
	return createUser(response.data);
}

export async function getUserRecipes(ids: string): Promise<UserRecipe[]> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<UserRecipeResponse[]>(
		`/users/me/recipes?ids=${ids}`,
	);
	return response.data.map(createUserRecipe);
}

export async function updateUserRecipe(
	recipeId: number,
	request: UserRecipeRequest,
): Promise<void> {
	const axiosClient = createAxiosClient();
	await axiosClient.put<UserRecipeRequest, boolean>(
		`/users/me/recipes/${recipeId}`,
		request,
	);
}
