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

export interface UserResponse {
	id: number;
	name: string | null;
	email: string;
	avatar_url?: string | null;
	last_login_at?: string | null; // ISO 8601形式の文字列
	bio?: string | null; // ユーザーの自己紹介やプロフィール情報
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
