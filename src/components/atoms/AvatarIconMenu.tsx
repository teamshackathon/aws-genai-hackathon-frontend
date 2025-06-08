import {
	Avatar,
	Button,
	HStack,
	Icon,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaCog, FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";

import { isLoggedInAtom, logoutAtom } from "@/lib/atom/AuthAtom";
import { userAtom } from "@/lib/atom/UserAtom";

import { useAtomValue, useSetAtom } from "jotai";

import { useNavigate } from "react-router";

// Motion components
const MotionButton = motion(Button);

const AvatarIconMenu = () => {
	const navigate = useNavigate();

	const isLoggedIn = useAtomValue(isLoggedInAtom);
	const user = useAtomValue(userAtom);
	const logout = useSetAtom(logoutAtom);

	const menuBg = useColorModeValue("white", "gray.800");
	const menuShadow = useColorModeValue("xl", "dark-lg");

	if (!isLoggedIn) {
		return (
			<MotionButton
				leftIcon={<Icon as={FaSignInAlt} />}
				onClick={() => {
					navigate("/auth/login");
				}}
				bg="whiteAlpha.200"
				color="white"
				border="1px"
				borderColor="whiteAlpha.300"
				_hover={{
					bg: "whiteAlpha.300",
					borderColor: "whiteAlpha.400",
					transform: "translateY(-2px)",
				}}
				_active={{
					transform: "translateY(0)",
				}}
				transitionDuration="0.2s"
				rounded="full"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				ログイン
			</MotionButton>
		);
	}

	return (
		<Menu>
			<MenuButton
				as={motion.div}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<HStack
					spacing={3}
					cursor="pointer"
					bg="whiteAlpha.200"
					px={3}
					py={2}
					rounded="full"
					border="1px"
					borderColor="whiteAlpha.300"
					_hover={{
						bg: "whiteAlpha.300",
						borderColor: "whiteAlpha.400",
					}}
					transitionDuration="0.2s"
				>
					<Avatar
						name={user?.name || "User"}
						src={user?.avatarUrl || undefined}
						size="sm"
						bg="orange.400"
					/>
					<Text
						color="white"
						fontWeight="medium"
						fontSize="sm"
						display={{ base: "none", md: "block" }}
					>
						{user?.name || "ユーザー"}
					</Text>
				</HStack>
			</MenuButton>

			<MenuList
				bg={menuBg}
				shadow={menuShadow}
				border="1px"
				borderColor={useColorModeValue("gray.200", "gray.600")}
				rounded="xl"
				overflow="hidden"
			>
				<MenuItem
					icon={<Icon as={FaUser} color="blue.400" />}
					onClick={() => navigate("/home/profile")}
					_hover={{ bg: useColorModeValue("blue.50", "blue.900") }}
					transitionDuration="0.2s"
				>
					<Text fontWeight="medium">プロフィール</Text>
				</MenuItem>

				<MenuItem
					icon={<Icon as={FaCog} color="gray.500" />}
					onClick={() => navigate("/home/setting")}
					_hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
					transitionDuration="0.2s"
				>
					<Text fontWeight="medium">設定</Text>
				</MenuItem>

				<MenuItem
					icon={<Icon as={FaSignOutAlt} color="red.400" />}
					onClick={logout}
					color="red.500"
					_hover={{ bg: useColorModeValue("red.50", "red.900") }}
					transitionDuration="0.2s"
				>
					<Text fontWeight="medium">ログアウト</Text>
				</MenuItem>
			</MenuList>
		</Menu>
	);
};

export default AvatarIconMenu;
