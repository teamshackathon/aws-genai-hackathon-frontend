import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";
import { User, type UserCreateRequest, type UserResponse } from "./UserQuery";

class AuthInPassword {
	constructor(
		public accessToken: string,
		public tokenType: string,
		public expiresIn: number,
		public refreshToken: string,
	) {}
}

export interface AuthInPasswordRequest {
	username: string;
	password: string;
}

export interface AuthInPasswordResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
}

function createAuthInPassword(res: AuthInPasswordResponse): AuthInPassword {
	return new AuthInPassword(
		res.access_token,
		res.token_type,
		res.expires_in,
		res.refresh_token,
	);
}

function createUser(res: UserResponse): User {
	return new User(
		res.id,
		res.name || "No Name", // 名前がnullの場合はデフォルト値を設定
		res.email,
		res.avatar_url || "", // アバターURLがnullの場合は空文字列を設定
		res.last_login_at ? new Date(res.last_login_at) : null,
        res.bio || null, // ユーザーの自己紹介やプロフィール情報
        res.serving_size || null, // ユーザーの料理のサービングサイズ（オプション）
        res.salt_preference || null, // ユーザーの塩分の好み（オプション）
        res.sweetness_preference || null, // ユーザーの甘さの好み（オプション）
        res.spiciness_preference || null, // ユーザーの辛さの
        res.cooking_time_preference || null, // ユーザーの料理時間の好み（オプション）
        res.meal_purpose || null, // ユーザーの食事の目的
        res.disliked_ingredients || null, // ユーザーが嫌いな食
        res.preference_trend || null, // ユーザーの好みのトレンド（オプション）
	);
}

export async function postAuthInPassword(
	username: string,
	password: string,
): Promise<AuthInPassword> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.login<
		AuthInPasswordRequest,
		AuthInPasswordResponse
	>("/auth/login/password", {
		username,
		password,
	});
	return createAuthInPassword(response.data);
}

export async function postUserCreate(
	request: UserCreateRequest,
): Promise<User> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.post<UserCreateRequest, UserResponse>(
		"/auth/register",
		request,
	);
	return createUser(response.data);
}
