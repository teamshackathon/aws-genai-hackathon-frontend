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
	Input,
	InputGroup,
	InputLeftElement,
	Spacer,
	Text,
	VStack,
	useColorModeValue,
	useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
	FaBars,
	FaBook,
	FaBookmark,
	FaCog,
	FaCookieBite,
	FaHeart,
	FaHistory,
	FaHome,
	FaSearch,
	FaUser,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router";

import AvatarIconMenu from "../atoms/AvatarIconMenu";

// Motion components
const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

export default function Header() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [searchValue, setSearchValue] = useState("");
	const navigate = useNavigate();

	const bgGradient = useColorModeValue(
		"linear(to-r, orange.400, pink.400)",
		"linear(to-r, orange.600, pink.600)",
	);
	const textColor = "white";
	const searchBg = useColorModeValue("whiteAlpha.200", "whiteAlpha.300");
	const searchBorder = useColorModeValue("whiteAlpha.300", "whiteAlpha.400");
	const drawerBg = useColorModeValue("white", "gray.800");

	const sidebarItems = [
		{ icon: FaHome, label: "ホーム", href: "/home", badge: null },
		{ icon: FaBook, label: "レシピ一覧", href: "/home/recipe", badge: null },
		{
			icon: FaBookmark,
			label: "お気に入り",
			href: "/home/favorites",
			badge: "12",
		},
		{ icon: FaHistory, label: "履歴", href: "/home/history", badge: null },
		{ icon: FaUser, label: "プロフィール", href: "/home/profile", badge: null },
		{ icon: FaCog, label: "設定", href: "/home/setting", badge: null },
	];

	const handleNavigate = (href: string) => {
		navigate(href);
		onClose();
	};

	return (
		<>
			<MotionBox
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
			>
				<Flex
					bgGradient={bgGradient}
					alignItems="center"
					px={6}
					py={4}
					shadow="lg"
					position="sticky"
					top={0}
					zIndex={1000}
					backdropFilter="blur(10px)"
				>
					{/* 左側: サイドバーボタンとロゴ */}
					<HStack spacing={4}>
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
						<MotionBox
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.2 }}
						>
							<HStack spacing={2}>
								<Icon as={FaCookieBite} boxSize={8} color={textColor} />
								<Text
									fontSize={{ base: "xl", md: "2xl" }}
									fontWeight="bold"
									color={textColor}
									letterSpacing="tight"
								>
									BAE RECIPE
								</Text>
								<Icon as={HiSparkles} boxSize={5} color="yellow.200" />
							</HStack>
						</MotionBox>{" "}
					</HStack>

					{/* 中央: 検索窓 */}
					<MotionBox
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						flex={2}
						maxW="100%"
						mx={{ base: 4, md: 8 }}
						display={{ base: "none", md: "block" }}
					>
						<InputGroup w={"100%"} size="lg">
							<InputLeftElement pointerEvents="none" h="full">
								<Icon as={FaSearch} color="whiteAlpha.700" boxSize={5} />
							</InputLeftElement>
							<Input
								placeholder="レシピを検索..."
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								bg={searchBg}
								border="1px"
								borderColor={searchBorder}
								color={textColor}
								fontSize="md"
								h="48px"
								pl={12}
								_placeholder={{ color: "whiteAlpha.700" }}
								_focus={{
									bg: "whiteAlpha.300",
									borderColor: "whiteAlpha.500",
									boxShadow: "0 0 0 1px rgba(255,255,255,0.3)",
								}}
								_hover={{
									bg: "whiteAlpha.250",
									borderColor: "whiteAlpha.400",
								}}
								rounded="full"
								transition="all 0.3s"
								w={"100%"}
							/>
						</InputGroup>
					</MotionBox>

					<Spacer />

					{/* 右側: アバターメニュー */}
					<MotionBox
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<AvatarIconMenu />
					</MotionBox>
				</Flex>
			</MotionBox>

			{/* サイドバー */}
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
										<Icon as={item.icon} boxSize={5} color="gray.600" mr={4} />
										<Text fontWeight="medium" flex={1}>
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
											42
										</Badge>
									</Flex>
									<Flex justify="space-between" align="center">
										<HStack spacing={2}>
											<Icon as={FaHeart} boxSize={4} color="red.400" />
											<Text fontSize="sm">お気に入り</Text>
										</HStack>
										<Badge colorScheme="red" rounded="full">
											12
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
}
