import { authTokenAtom } from "@/lib/atom/AuthAtom";
import { userAtom } from "@/lib/atom/UserAtom";
import { Button, useToast } from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import { useNavigate } from "react-router";

export default function LogoutButton() {
	const setAuthToken = useSetAtom(authTokenAtom);
	const setUser = useSetAtom(userAtom);
	const navigate = useNavigate();
	const toast = useToast();

	const handleLogout = () => {
		// トークンとユーザー情報をクリア
		setAuthToken(null);
		setUser(null);

		toast({
			title: "ログアウトしました",
			status: "success",
			duration: 3000,
		});

		navigate("/login");
	};

	return (
		<Button onClick={handleLogout} variant="ghost" colorScheme="red">
			ログアウト
		</Button>
	);
}
