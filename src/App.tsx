import { BrowserRouter, Route, Routes } from "react-router";

import MainPage from "@/components/pages/MainPage";

function App() {
	return (
		<BrowserRouter basename="/bae-recipe">
			<Routes>
				<Route path="/" element={<MainPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
