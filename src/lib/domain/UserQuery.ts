import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

export class User {
	constructor(
		public id: number,
		public name: string | null,
		public email: string,
		public avatarUrl?: string | null,
		public lastLoginAt?: Date | null,
	) {}
}

export interface UserResponse {
	id: number;
	name: string | null;
	email: string;
	avatar_url?: string | null;
	last_login_at?: string | null; // ISO 8601形式の文字列
}

function createUser(res: UserResponse): User {
	return new User(
		res.id,
		res.name,
		res.email,
		res.avatar_url || null,
		res.last_login_at ? new Date(res.last_login_at) : null,
	);
}

export async function getUser(): Promise<User> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<UserResponse>("/users/me");
	return createUser(response.data);
}
