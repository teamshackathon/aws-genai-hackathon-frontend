import { AuthProvider } from "@/lib/provider/AuthProvider";
import { ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
	createRoot(rootElement).render(
		<ChakraProvider>
			<AuthProvider>
				<App />
			</AuthProvider>
		</ChakraProvider>,
	);
} else {
	console.error("Root element with id 'root' not found");
}
