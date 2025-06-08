import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import {
	type AuthInPasswordRequest,
	postAuthInPassword,
} from "../domain/AuthQuery";
import { userAtom } from "./UserAtom";

export const authTokenAtom = atomWithStorage<string | null>(
	"auth_token",
	null,
	createJSONStorage(),
	{ getOnInit: true },
);

// 認証状態を表すatom
export const isAuthenticatedAtom = atom((get) => get(authTokenAtom) !== null);

// ログイン中かどうかを示すatom
export const isLoadingAuthAtom = atom<boolean>(false);

// ログイン済みかどうかを示すatom
export const isLoggedInAtom = atom((get) => {
	const authToken = get(authTokenAtom);
	const user = get(userAtom);
	return (
		authToken !== null &&
		authToken !== undefined &&
		user !== null &&
		user !== undefined
	);
});

// write only aton
// PasswordInログインするためのatom
export const loginInPasswordAtom = atom(
	null,
	async (_, set, { username, password }: AuthInPasswordRequest) => {
		set(isLoadingAuthAtom, true);
		try {
			const authData = await postAuthInPassword(username, password);
			set(authTokenAtom, authData.accessToken);
		} catch (error) {
			console.error("Login failed:", error);
		} finally {
			set(isLoadingAuthAtom, false);
		}
	},
);

// Githubログインするためのatom
export const loginInGithubAtom = atom(null, async (_, set) => {
	set(isLoadingAuthAtom, true);
	try {
		window.location.href = `${import.meta.env.VITE_PUBLIC_API_URL}/auth/login/github`;
	} catch (error) {
		console.error("GitHub login failed:", error);
	} finally {
		set(isLoadingAuthAtom, false);
	}
});

// ログアウト処理を行うatom
export const logoutAtom = atom(null, (_, set) => {
	set(authTokenAtom, null); // 認証トークンをクリア
	sessionStorage.removeItem("returnUrl"); // セッションストレージのクリア
	set(isLoadingAuthAtom, false); // ログイン状態をリセット
	set(userAtom, null); // ユーザー情報をクリア
});
