import { recipeListAtomLoadable } from "@/lib/atom/RecipeAtom";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";
import {
	Badge,
	Box,
	Divider,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	HStack,
	Icon,
	IconButton,
	Text,
	VStack,
	useColorModeValue,
	useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
	FaBars,
	FaBook,
	FaClipboardList,
	FaCog,
	FaCookieBite,
	FaHistory,
	FaHome,
	FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router";

const MotionIconButton = motion(IconButton);
const MotionBox = motion(Box);

const SiderDrawer = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const navigate = useNavigate();

	const textColor = "white";
	const drawerBg = useColorModeValue("white", "gray.800");

	const recipeList = useLoadableAtom(recipeListAtomLoadable);

	const sidebarItems = [
		{ icon: FaHome, label: "ホーム", href: "/home", badge: null },
		{ icon: FaHistory, label: "履歴", href: "/home/history", badge: null },
		{
			icon: FaClipboardList,
			label: "買い物リスト",
			href: "/home/shopping_list",
			badge: null,
		},
		{ icon: FaUser, label: "プロフィール", href: "/home/profile", badge: null },
		{ icon: FaCog, label: "設定", href: "/home/setting", badge: null },
	];

	const handleNavigate = (href: string) => {
		navigate(href);
		onClose();
	};

	return (
		<>
			<MotionIconButton
				aria-label="メニューを開く"
				icon={<Icon as={FaBars} />}
				variant="ghost"
				color={textColor}
				size="lg"
				whileHover={{ scale: 1.1, rotate: 90 }}
				whileTap={{ scale: 0.95 }}
				transition={{ duration: 0.2 }}
				_hover={{
					bg: "whiteAlpha.200",
					transform: "scale(1.1)",
				}}
				onClick={onOpen}
			/>
			<Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
				<DrawerOverlay backdropFilter="blur(4px)" />
				<DrawerContent bg={drawerBg} shadow="2xl">
					<DrawerCloseButton
						size="lg"
						_hover={{
							bg: "red.100",
							color: "red.500",
							transform: "scale(1.1)",
						}}
						transition="all 0.2s"
					/>

					<DrawerHeader borderBottomWidth="1px" py={6}>
						<HStack spacing={3}>
							<Box
								bgGradient="linear(to-r, orange.400, pink.400)"
								p={2}
								rounded="lg"
							>
								<Icon as={FaCookieBite} boxSize={6} color="white" />
							</Box>
							<VStack align="start" spacing={0}>
								<Text fontSize="lg" fontWeight="bold">
									BAE RECIPE
								</Text>
								<Text fontSize="sm" color="gray.500">
									あなたのレシピコレクション
								</Text>
							</VStack>
						</HStack>
					</DrawerHeader>

					<DrawerBody px={0}>
						<VStack spacing={2} align="stretch" pt={4}>
							{sidebarItems.map((item, index) => (
								<MotionBox
									key={item.label}
									initial={{ opacity: 0, x: -50 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
									whileHover={{ x: 4 }}
								>
									<Flex
										align="center"
										px={6}
										py={3}
										cursor="pointer"
										_hover={{
											bg: useColorModeValue("orange.50", "gray.700"),
											borderRight: "4px solid",
											borderRightColor: "orange.400",
										}}
										transition="all 0.2s"
										onClick={handleNavigate.bind(null, item.href)}
									>
										<Icon
											as={item.icon}
											boxSize={5}
											color={useColorModeValue("gray.600", "gray.300")}
											mr={4}
										/>
										<Text
											fontWeight="medium"
											flex={1}
											color={useColorModeValue("gray.800", "white")}
										>
											{item.label}
										</Text>
										{item.badge && (
											<Badge
												colorScheme="orange"
												rounded="full"
												px={2}
												fontSize="xs"
											>
												{item.badge}
											</Badge>
										)}
									</Flex>
								</MotionBox>
							))}

							<Divider my={4} />

							{/* 統計情報 */}
							<MotionBox
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.8 }}
								px={6}
								py={4}
							>
								<Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3}>
									統計
								</Text>
								<VStack spacing={3} align="stretch">
									<Flex justify="space-between" align="center">
										<HStack spacing={2}>
											<Icon as={FaBook} boxSize={4} color="blue.400" />
											<Text fontSize="sm">保存レシピ</Text>
										</HStack>
										<Badge colorScheme="blue" rounded="full">
											{recipeList?.total}
										</Badge>
									</Flex>
								</VStack>
							</MotionBox>
						</VStack>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
};

export default SiderDrawer;
