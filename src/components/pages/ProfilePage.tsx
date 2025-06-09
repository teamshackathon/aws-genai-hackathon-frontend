import { updateUserAtom, userAtom } from "@/lib/atom/UserAtom";
import type { User } from "@/lib/domain/UserQuery";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Container,
	Divider,
	FormControl,
	FormLabel,
	Grid,
	HStack,
	Icon,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	Textarea,
	VStack,
	useColorModeValue,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
	FaCalendarAlt,
	FaCamera,
	FaEdit,
	FaSave,
	FaTimes,
	FaUser,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import Header from "../organisms/Header";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function ProfilePage() {
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Color values
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, gray.900, purple.900, pink.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.800", "white");
	const mutedColor = useColorModeValue("gray.600", "gray.400");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	const user = useAtomValue(userAtom);
	const update = useSetAtom(updateUserAtom);

	const [editingProfile, setEditingProfile] = useState<User>({
		id: 0,
		name: "",
		email: "",
		bio: "",
		avatarUrl: "",
		lastLoginAt: new Date(),
	});

	// Initialize editing profile when user data changes
	useEffect(() => {
		if (user) {
			setEditingProfile({
				id: user.id,
				name: user.name || "",
				email: user.email || "",
				bio: user.bio || "",
				avatarUrl: user.avatarUrl || "",
				lastLoginAt: user.lastLoginAt || new Date(),
			});
		}
	}, [user]);

	const handleEdit = () => {
		setIsEditing(true);
		if (user) {
			setEditingProfile({
				id: user.id,
				name: user.name || "",
				email: user.email || "",
				bio: user.bio || "",
				avatarUrl: user.avatarUrl || "",
				lastLoginAt: user.lastLoginAt || new Date(),
			});
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		if (user) {
			setEditingProfile({
				id: user.id,
				name: user.name || "",
				email: user.email || "",
				bio: user.bio || "",
				avatarUrl: user.avatarUrl || "",
				lastLoginAt: user.lastLoginAt || new Date(),
			});
		}
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await update({
				name: editingProfile.name,
				email: editingProfile.email,
				bio: editingProfile.bio,
				avatar_url: editingProfile.avatarUrl,
			});
			setIsEditing(false);
			toast({
				title: "プロフィールを更新しました",
				description: "変更が正常に保存されました。",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			toast({
				title: "エラーが発生しました",
				description: "プロフィールの更新に失敗しました。",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			<Header />

			<Container maxW="6xl" py={8}>
				<VStack spacing={8} align="stretch">
					{/* Header with animations */}
					<MotionBox
						initial={{ opacity: 0, y: -50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						<HStack justify="space-between" align="center" mb={2}>
							<HStack spacing={3}>
								<Icon as={FaUser} boxSize={8} color="orange.400" />
								<VStack align="start" spacing={0}>
									<Text fontSize="3xl" fontWeight="bold" color={textColor}>
										プロフィール
									</Text>
									<Text color={mutedColor}>
										あなたの情報を管理・編集できます
									</Text>
								</VStack>
								<Icon as={HiSparkles} boxSize={5} color="yellow.400" />
							</HStack>

							<AnimatePresence mode="wait">
								{!isEditing ? (
									<MotionButton
										key="edit"
										leftIcon={<FaEdit />}
										colorScheme="orange"
										variant="solid"
										size="lg"
										onClick={handleEdit}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										編集
									</MotionButton>
								) : (
									<HStack spacing={3}>
										<MotionButton
											key="cancel"
											leftIcon={<FaTimes />}
											variant="ghost"
											size="lg"
											onClick={handleCancel}
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											whileHover={{ scale: 1.05 }}
										>
											キャンセル
										</MotionButton>
										<MotionButton
											key="save"
											leftIcon={<FaSave />}
											colorScheme="green"
											size="lg"
											onClick={handleSave}
											isLoading={isLoading}
											loadingText="保存中..."
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											保存
										</MotionButton>
									</HStack>
								)}
							</AnimatePresence>
						</HStack>
						<Divider borderColor={borderColor} />
					</MotionBox>{" "}
					{/* Single Column Layout */}
					<VStack spacing={6} maxW="4xl" mx="auto">
						{/* Basic Information with Avatar */}
						<MotionCard
							bg={cardBg}
							shadow="xl"
							borderRadius="2xl"
							w="full"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<CardHeader pb={3}>
								<HStack spacing={3}>
									<Icon as={FaUser} boxSize={5} color="orange.400" />
									<Text fontSize="xl" fontWeight="bold" color={textColor}>
										基本情報
									</Text>
								</HStack>
							</CardHeader>
							<CardBody pt={0}>
								<VStack spacing={8}>
									{/* Avatar Section */}
									<VStack spacing={4}>
										<Box position="relative">
											<Avatar
												size="2xl"
												src={user?.avatarUrl || undefined}
												name={user?.name || "User"}
												border="4px solid"
												borderColor="orange.400"
											/>
											{isEditing && (
												<MotionBox
													position="absolute"
													bottom={0}
													right={0}
													bg="orange.400"
													rounded="full"
													p={2}
													cursor="pointer"
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													whileHover={{ scale: 1.1 }}
													onClick={onOpen}
												>
													<Icon as={FaCamera} color="white" boxSize={4} />
												</MotionBox>
											)}
										</Box>
									</VStack>

									{/* Form Fields */}
									<Grid
										templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
										gap={6}
										w="full"
									>
										<FormControl>
											<FormLabel fontSize="sm" color={mutedColor}>
												名前
											</FormLabel>
											{isEditing ? (
												<Input
													value={editingProfile.name}
													onChange={(e) =>
														setEditingProfile({
															...editingProfile,
															name: e.target.value,
														})
													}
													bg={useColorModeValue("gray.50", "gray.700")}
													border="1px"
													borderColor={borderColor}
													_focus={{
														borderColor: "orange.400",
														boxShadow: "0 0 0 1px orange.400",
													}}
												/>
											) : (
												<Text fontWeight="medium" py={2}>
													{user?.name}
												</Text>
											)}
										</FormControl>

										<FormControl>
											<FormLabel fontSize="sm" color={mutedColor}>
												メールアドレス
											</FormLabel>
											{isEditing ? (
												<Input
													type="email"
													value={editingProfile.email}
													onChange={(e) =>
														setEditingProfile({
															...editingProfile,
															email: e.target.value,
														})
													}
													bg={useColorModeValue("gray.50", "gray.700")}
													border="1px"
													borderColor={borderColor}
													_focus={{
														borderColor: "orange.400",
														boxShadow: "0 0 0 1px orange.400",
													}}
												/>
											) : (
												<Text fontWeight="medium" py={2}>
													{user?.email}
												</Text>
											)}
										</FormControl>
									</Grid>

									{/* Bio Section - Full Width */}
									<FormControl>
										<FormLabel fontSize="sm" color={mutedColor}>
											自己紹介
										</FormLabel>
										{isEditing ? (
											<Textarea
												value={editingProfile.bio}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														bio: e.target.value,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												rows={4}
												resize="vertical"
											/>
										) : (
											<Text
												color={mutedColor}
												fontSize="sm"
												lineHeight="tall"
												p={2}
											>
												{user?.bio}
											</Text>
										)}
									</FormControl>

									{/* Additional Info */}
									<Grid
										templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
										gap={4}
										w="full"
									>
										<HStack
											justify="space-between"
											p={3}
											bg={useColorModeValue("gray.50", "gray.700")}
											rounded="lg"
										>
											<HStack spacing={2}>
												<Icon as={FaCalendarAlt} color="gray.400" />
												<Text fontSize="sm" color={mutedColor}>
													最終ログイン日
												</Text>
											</HStack>
											<Text fontSize="sm" fontWeight="medium">
												{user?.lastLoginAt?.toLocaleDateString("ja-JP")}
											</Text>
										</HStack>
									</Grid>
								</VStack>
							</CardBody>
						</MotionCard>
					</VStack>
				</VStack>
			</Container>

			{/* Avatar Change Modal */}
			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay backdropFilter="blur(10px)" />
				<ModalContent>
					<ModalHeader>プロフィール画像を変更</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4}>
							<Text color={mutedColor}>
								新しいプロフィール画像をアップロードしてください
							</Text>
							<Button
								leftIcon={<FaCamera />}
								colorScheme="orange"
								variant="outline"
								w="full"
							>
								画像を選択
							</Button>
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={onClose}>
							キャンセル
						</Button>
						<Button colorScheme="orange">アップロード</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
}
