import { ProtectedRoute } from "@/lib/route/ProtectedRoute";
import { BrowserRouter, Route, Routes } from "react-router";

import CallbackPage from "@/components/pages/CallbackPage";
import LandingPage from "@/components/pages/LandingPage";
import LoginPage from "@/components/pages/LoginPage";
import MainPage from "@/components/pages/MainPage";

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
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
