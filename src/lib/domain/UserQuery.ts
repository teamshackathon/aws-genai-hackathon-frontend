import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

export class User {
	constructor(
		public id: number,
		public name: string,
		public email: string,
		public avatarUrl: string,
		public lastLoginAt: Date | null,
		public bio: string | null, // ユーザーの自己紹介やプロフィール情報
		public servingSize: number | null, // ユーザーの料理のサービングサイズ（オプション）
		public saltPreference: string | null, // ユーザーの塩分の好み（オプション）
		public sweetnessPreference: string | null, // ユーザーの甘さの好み（オプション）
		public spicinessPreference: string | null, // ユーザーの辛さの好み（オプション）
		public cookingTimePreference: string | null, // ユーザーの料理時間の好み（オプション）
		public mealPurpose: string | null, // ユーザーの食事の目的（オプション）
		public dislikedIngredients: string | null, // ユーザーが嫌いな食材のリスト（オプション）
		public preferenceTrend: string | null, // ユーザーの好みのトレンド（オプション）
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
	bio: string | null; // ユーザーの自己紹介やプロフィール情報
	serving_size: number | null; // ユーザーの料理のサービングサイズ（オプション）
	salt_preference: string | null; // ユーザーの塩分の好み（オプション）
	sweetness_preference: string | null; // ユーザーの甘さの好み（オプション）
	spiciness_preference: string | null; // ユーザーの辛さの好み（オプション）
	cooking_time_preference: string | null; // ユーザーの料理時間の好み（オプション）
	meal_purpose: string | null; // ユーザーの食事の目的（オプション）
	disliked_ingredients: string | null; // ユーザーが嫌いな食材のリスト（オプション）
	preference_trend: string | null; // ユーザーの好みのトレンド（オプション）
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
	bio: string | null;
	serving_size?: number | null;
	salt_preference?: string | null;
	sweetness_preference?: string | null;
	spiciness_preference?: string | null;
	cooking_time_preference?: string | null;
	meal_purpose?: string | null;
	disliked_ingredients?: string | null; // ユーザーが嫌いな食材のリスト（オプション）
	preference_trend?: string | null;
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
		res.last_login_at ? new Date(res.last_login_at) : new Date(), // 最終ログイン日時がnullの場合は1970年1月1日を設定
		res.bio || "", // ユーザーの自己紹介やプロフィール情報
		res.serving_size || null, // ユーザーの料理のサービングサイズ（オプション）
		res.salt_preference || "", // ユーザーの塩分の好み（オプション）
		res.sweetness_preference || "", // ユーザーの甘さの好み（オプション）
		res.spiciness_preference || "", // ユーザーの辛さの好み（オプション）
		res.cooking_time_preference || "", // ユーザーの料理時間の好み（オプション）
		res.meal_purpose || "", // ユーザーの食事の目的（オプション）
		res.disliked_ingredients || "", // ユーザーが嫌いな食材のリスト（オプション）
		res.preference_trend || "", // ユーザーの好みのトレンド（オプション）
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
