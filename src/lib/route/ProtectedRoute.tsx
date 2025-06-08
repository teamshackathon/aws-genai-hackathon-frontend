import { authTokenAtom, isLoadingAuthAtom } from "@/lib/atom/AuthAtom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { Navigate, Outlet, useLocation } from "react-router";
import { isUserLoadingAtom, userAtom } from "../atom/UserAtom";

/**
 * 認証が必要なルートを保護するコンポーネント
 * 認証されていない場合は、ログインページにリダイレクトする
 */
export function ProtectedRoute() {
	const authToken = useAtomValue(authTokenAtom);
	const user = useAtomValue(userAtom);
	const isLoading = useAtomValue(isLoadingAuthAtom);
	const isUserLoading = useAtomValue(isUserLoadingAtom);
	const location = useLocation();

	// 認証状態が読み込み中の場合は、ローディング表示
	if (isLoading || isUserLoading || user === undefined) {
		return (
			<Center h="100vh">
				<Spinner size="xl" />
			</Center>
		);
	}

	// 認証されていない場合は、現在のパスを記録してログインページにリダイレクト
	if (!authToken || !user) {
		// 現在のURLをセッションストレージに保存して、ログイン後にリダイレクトできるようにする
		sessionStorage.setItem("returnUrl", location.pathname + location.search);

		// ログインページにリダイレクト
		return <Navigate to="/auth/login" state={{ from: location }} replace />;
	}

	// 認証されている場合は子コンポーネントをレンダリング
	return <Outlet />;
}
