import { type User, getUser } from "@/lib/domain/UserQuery";
import { atom } from "jotai";

export const userAtom = atom<User | null>(null);

export const isUserLoadingAtom = atom<boolean>(false);

// write only atom
// ユーザー情報を取得するためのatom
export const getUserAtom = atom(null, async (_, set) => {
	set(isUserLoadingAtom, true);
	try {
		const res = await getUser();
		set(userAtom, res);
	} catch (error) {
		console.error("Failed to fetch user data:", error);
	} finally {
		set(isUserLoadingAtom, false);
	}
});
