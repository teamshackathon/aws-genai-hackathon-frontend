import { authTokenAtom } from "@/lib/atom/AuthAtom";
import {
	Alert,
	AlertIcon,
	Center,
	Spinner,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

/**
 * GitHub OAuth認証後のコールバックを処理するコンポーネント
 * URLパラメータからトークンを取得し、認証状態を設定する
 */
export default function CallbackPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const setAuthToken = useSetAtom(authTokenAtom);
	const [_, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const processCallback = async () => {
			try {
				// URLパラメータからトークン情報を取得
				const accessToken = searchParams.get("access_token");
				const tokenType = searchParams.get("token_type");
				const expiresIn = searchParams.get("expires_in");

				if (!accessToken) {
					setError("アクセストークンが見つかりませんでした");
					setIsLoading(false);
					return;
				}

				console.log("トークンを取得しました", { tokenType, expiresIn });

				// トークンを保存
				setAuthToken(accessToken);

				// リダイレクト先を決定
				const returnUrl = sessionStorage.getItem("returnUrl") || "/home";
				sessionStorage.removeItem("returnUrl");

				// ダッシュボードページにリダイレクト
				navigate(returnUrl);
			} catch (e) {
				console.error("認証コールバックの処理に失敗しました:", e);
				setError("認証処理中にエラーが発生しました");
				setIsLoading(false);
			}
		};

		processCallback();
	}, [searchParams, setAuthToken, navigate]);

	if (error) {
		return (
			<Center height="100vh">
				<VStack spacing={4}>
					<Alert status="error">
						<AlertIcon />
						{error}
					</Alert>
					<Text>
						<a href="/auth/login">ログインページに戻る</a>
					</Text>
				</VStack>
			</Center>
		);
	}

	return (
		<Center height="100vh">
			<VStack spacing={4}>
				<Spinner size="xl" />
				<Text>認証中...</Text>
			</VStack>
		</Center>
	);
}
