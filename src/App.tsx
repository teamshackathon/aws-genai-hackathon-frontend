import { ProtectedRoute } from "@/lib/route/ProtectedRoute";
import { BrowserRouter, Route, Routes } from "react-router";

import CallbackPage from "@/components/pages/CallbackPage";
import LandingPage from "@/components/pages/LandingPage";
import LoginPage from "@/components/pages/LoginPage";
import MainPage from "@/components/pages/MainPage";
import ProfilePage from "@/components/pages/ProfilePage";
// import RecipePage from "@/components/pages/RecipePage";
import SettingPage from "@/components/pages/SettingPage";

function App() {
	return (
		<BrowserRouter basename="/bae-recipe">
			<Routes>
				<Route path="/" element={<LandingPage />} />

				{/* ログイン関係のルート */}
				<Route path="/auth/login" element={<LoginPage />} />
				<Route path="/auth/callback" element={<CallbackPage />} />

				{/* ルートが存在しない場合の404ページ */}
				{/* 認証が必要なルート */}
				<Route element={<ProtectedRoute />}>
					<Route path="/home" element={<MainPage />} />
					{/* <Route path="/home/recipe" element={<RecipePage />} /> */}
					{/* <Route path="/home/recipe/:recipe_id" element={<RecipeDetailPage />} /> */}
					<Route path="/home/setting" element={<SettingPage />} />
					<Route path="/home/profile" element={<ProfilePage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
