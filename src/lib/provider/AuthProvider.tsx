import { authTokenAtom, isLoadingAuthAtom } from "@/lib/atom/AuthAtom";
import { getUserAtom, userAtom } from "@/lib/atom/UserAtom";
import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [authToken, setAuthToken] = useAtom(authTokenAtom);
	const setIsLoadingAuth = useSetAtom(isLoadingAuthAtom);
	const setUser = useSetAtom(userAtom);
	const getUser = useSetAtom(getUserAtom);

	useEffect(() => {
		const initializeAuth = async () => {
			if (!authToken) {
				setUser(null);
			}
			setIsLoadingAuth(true);
			try {
				await getUser();
			} catch (error) {
				console.error("Failed to fetch user data:", error);
				setAuthToken(null);
				setUser(null);
			} finally {
				setIsLoadingAuth(false);
			}
		};

		initializeAuth();
	}, [authToken, setAuthToken, setIsLoadingAuth, getUser, setUser]);

	return <>{children}</>;
}
