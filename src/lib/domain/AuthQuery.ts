import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

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
