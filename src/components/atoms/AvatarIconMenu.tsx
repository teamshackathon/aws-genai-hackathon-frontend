import {
	Avatar,
	Button,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
} from "@chakra-ui/react";

import { isLoggedInAtom, logoutAtom } from "@/lib/atom/AuthAtom";
import { userAtom } from "@/lib/atom/UserAtom";

import { useAtomValue, useSetAtom } from "jotai";

import { useNavigate } from "react-router";

const AvatarIconMenu = () => {
	const navigate = useNavigate();

	const isLoggedIn = useAtomValue(isLoggedInAtom);
	const user = useAtomValue(userAtom);
	const logout = useSetAtom(logoutAtom);

	if (!isLoggedIn) {
		return (
			<Button
				onClick={() => {
					navigate("/auth/login");
				}}
			>
				ログイン
			</Button>
		);
	}

	return (
		<Menu>
			<MenuButton>
				<Avatar
					name={user?.name || "User"}
					src={user?.avatarUrl || undefined}
					size="md"
					cursor="pointer"
					bg="gray.200"
					_hover={{ bg: "gray.300" }}
				/>
			</MenuButton>
			<MenuList>
				<MenuItem onClick={() => alert("Profile clicked")}>
					プロフィール
				</MenuItem>
				<MenuItem onClick={() => alert("Settings clicked")}>設定</MenuItem>
				<MenuItem onClick={logout} color="red.500">
					ログアウト
				</MenuItem>
			</MenuList>
		</Menu>
	);
};

export default AvatarIconMenu;
