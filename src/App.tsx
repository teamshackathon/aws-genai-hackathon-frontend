import { useEffect } from "react";

import { useToast } from "@chakra-ui/react";

import { ProtectedRoute } from "@/lib/route/ProtectedRoute";
import { BrowserRouter, Route, Routes } from "react-router";

import CallbackPage from "@/components/pages/CallbackPage";
import CookPage from "@/components/pages/CookPage";
import LandingPage from "@/components/pages/LandingPage";
import LoginPage from "@/components/pages/LoginPage";
import MainPage from "@/components/pages/MainPage";
import NotFoundPage from "@/components/pages/NotFoundPage";
import ProfilePage from "@/components/pages/ProfilePage";
import RecipeAIGenPage from "@/components/pages/RecipeAIGenPage";
import RecipePage from "@/components/pages/RecipePage";
import RegisterPage from "@/components/pages/RegisterPage";
import SettingPage from "@/components/pages/SettingPage";
import ShoppingListDetailPage from "@/components/pages/ShoppingListDetailPage";
import ShoppingListPage from "@/components/pages/ShoppingListPage";
import HistoryPage from "./components/pages/HistroyPage";

import { toastAtom } from "@/lib/atom/BaseAtom";
import { useAtom } from "jotai";

function App() {
	const toast = useToast();
	const [toastState, setToastState] = useAtom(toastAtom);

	useEffect(() => {
		if (toastState) {
			toast({
				...toastState,
				position: "top",
				duration: 5000,
				isClosable: true,
			});
			setToastState(null); // トースト表示後に状態をリセット
		}
	}, [toastState]);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				{/* ログイン関係のルート */}
				<Route path="/auth/login" element={<LoginPage />} />
				<Route path="/auth/register" element={<RegisterPage />} />
				<Route path="/auth/callback" element={<CallbackPage />} />

				{/* ルートが存在しない場合の404ページ */}
				{/* 認証が必要なルート */}
				<Route element={<ProtectedRoute />}>
					<Route path="/home" element={<MainPage />} />
					<Route path="/home/ai-gen" element={<RecipeAIGenPage />} />
					<Route path="/home/recipe/:recipeId" element={<RecipePage />} />
					<Route path="/home/recipe/:recipeId/cook" element={<CookPage />} />
					<Route path="/home/setting" element={<SettingPage />} />
					<Route path="/home/profile" element={<ProfilePage />} />
					<Route path="/home/history" element={<HistoryPage />} />

					{/* ★ここから追加する買い物リスト関連のルート */}
					<Route path="/home/shopping_list" element={<ShoppingListPage />} />
					<Route
						path="/home/shopping_list/:shoppingListId"
						element={<ShoppingListDetailPage />}
					/>
					{/* ★ここまで追加 */}
					<Route path="*" element={<NotFoundPage />} />
				</Route>

				{/* 404 Not Found - キャッチオールルート */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
