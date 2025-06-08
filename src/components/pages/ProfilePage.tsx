import {
	Avatar,
	Badge,
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
	Select,
	Stat,
	StatLabel,
	StatNumber,
	Switch,
	Text,
	Textarea,
	VStack,
	useColorModeValue,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
	FaBell,
	FaBook,
	FaCalendarAlt,
	FaCamera,
	FaCog,
	FaCookieBite,
	FaEdit,
	FaHeart,
	FaLanguage,
	FaMapMarkerAlt,
	FaPalette,
	FaSave,
	FaTimes,
	FaUser,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

interface UserProfile {
	id: string;
	name: string;
	email: string;
	bio: string;
	avatar: string;
	location: string;
	birthday: string;
	phone: string;
	website: string;
	joinDate: string;
	favoriteRecipes: number;
	savedRecipes: number;
	totalViews: number;
	preferences: {
		notifications: boolean;
		darkMode: boolean;
		language: string;
	};
}

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

	// Mock user data
	const [userProfile, setUserProfile] = useState<UserProfile>({
		id: "user-123",
		name: "田中 美咲",
		email: "tanaka.misaki@example.com",
		bio: "料理が大好きな主婦です。家族のために美味しくて健康的な料理を作ることが私の喜びです。特に和食とイタリアンが得意で、新しいレシピを考えるのが趣味です。",
		avatar:
			"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
		location: "東京都渋谷区",
		birthday: "1985-03-15",
		phone: "090-1234-5678",
		website: "https://misaki-cooking.blog",
		joinDate: "2023-01-15",
		favoriteRecipes: 42,
		savedRecipes: 128,
		totalViews: 1247,
		preferences: {
			notifications: true,
			darkMode: false,
			language: "ja",
		},
	});

	const [editingProfile, setEditingProfile] =
		useState<UserProfile>(userProfile);

	const handleEdit = () => {
		setIsEditing(true);
		setEditingProfile({ ...userProfile });
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEditingProfile(userProfile);
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setUserProfile(editingProfile);
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

	const statsData = [
		{
			label: "お気に入りレシピ",
			value: userProfile.favoriteRecipes,
			icon: FaHeart,
			color: "red.400",
		},
		{
			label: "保存レシピ",
			value: userProfile.savedRecipes,
			icon: FaBook,
			color: "blue.400",
		},
		{
			label: "総閲覧数",
			value: userProfile.totalViews,
			icon: FaCookieBite,
			color: "orange.400",
		},
	];

	return (
		<Box minH="100vh" bgGradient={bgGradient} py={8}>
			<Container maxW="6xl">
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
					</MotionBox>

					<Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8}>
						{/* Left Column - Profile Summary & Stats */}
						<VStack spacing={6}>
							{/* Profile Card */}
							<MotionCard
								bg={cardBg}
								shadow="xl"
								borderRadius="2xl"
								overflow="hidden"
								w="full"
								initial={{ opacity: 0, x: -50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								whileHover={{ y: -5 }}
							>
								<CardBody p={8}>
									<VStack spacing={6}>
										{/* Avatar with edit functionality */}
										<Box position="relative">
											<Avatar
												size="2xl"
												src={userProfile.avatar}
												name={userProfile.name}
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

										<VStack spacing={2} textAlign="center">
											<Text fontSize="2xl" fontWeight="bold" color={textColor}>
												{userProfile.name}
											</Text>
											<Text color={mutedColor} fontSize="md">
												{userProfile.email}
											</Text>
											<Badge
												colorScheme="green"
												px={3}
												py={1}
												rounded="full"
												fontSize="sm"
											>
												アクティブユーザー
											</Badge>
										</VStack>

										<Text
											textAlign="center"
											color={mutedColor}
											fontSize="sm"
											lineHeight="tall"
										>
											{userProfile.bio}
										</Text>

										<VStack spacing={3} w="full">
											<HStack w="full" justify="space-between">
												<HStack spacing={2}>
													<Icon as={FaCalendarAlt} color="gray.400" />
													<Text fontSize="sm" color={mutedColor}>
														参加日
													</Text>
												</HStack>
												<Text fontSize="sm" fontWeight="medium">
													{new Date(userProfile.joinDate).toLocaleDateString(
														"ja-JP",
													)}
												</Text>
											</HStack>
											<HStack w="full" justify="space-between">
												<HStack spacing={2}>
													<Icon as={FaMapMarkerAlt} color="gray.400" />
													<Text fontSize="sm" color={mutedColor}>
														所在地
													</Text>
												</HStack>
												<Text fontSize="sm" fontWeight="medium">
													{userProfile.location}
												</Text>
											</HStack>
										</VStack>
									</VStack>
								</CardBody>
							</MotionCard>

							{/* Stats Cards */}
							<VStack spacing={4} w="full">
								{statsData.map((stat, index) => (
									<MotionCard
										key={stat.label}
										bg={cardBg}
										shadow="lg"
										borderRadius="xl"
										w="full"
										initial={{ opacity: 0, y: 50 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
										whileHover={{ scale: 1.02, y: -2 }}
									>
										<CardBody p={6}>
											<Stat>
												<HStack justify="space-between" align="center">
													<VStack align="start" spacing={1}>
														<StatLabel color={mutedColor} fontSize="sm">
															{stat.label}
														</StatLabel>
														<StatNumber
															fontSize="2xl"
															fontWeight="bold"
															color={textColor}
														>
															{stat.value.toLocaleString()}
														</StatNumber>
													</VStack>
													<Box
														bg={`${stat.color.split(".")[0]}.50`}
														p={3}
														rounded="xl"
													>
														<Icon
															as={stat.icon}
															boxSize={6}
															color={stat.color}
														/>
													</Box>
												</HStack>
											</Stat>
										</CardBody>
									</MotionCard>
								))}
							</VStack>
						</VStack>

						{/* Right Column - Detailed Information */}
						<VStack spacing={6}>
							{/* Basic Information */}
							<MotionCard
								bg={cardBg}
								shadow="xl"
								borderRadius="2xl"
								w="full"
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
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
									<VStack spacing={6}>
										<Grid templateColumns="repeat(2, 1fr)" gap={6} w="full">
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
														{userProfile.name}
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
														{userProfile.email}
													</Text>
												)}
											</FormControl>

											<FormControl>
												<FormLabel fontSize="sm" color={mutedColor}>
													電話番号
												</FormLabel>
												{isEditing ? (
													<Input
														value={editingProfile.phone}
														onChange={(e) =>
															setEditingProfile({
																...editingProfile,
																phone: e.target.value,
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
														{userProfile.phone}
													</Text>
												)}
											</FormControl>

											<FormControl>
												<FormLabel fontSize="sm" color={mutedColor}>
													ウェブサイト
												</FormLabel>
												{isEditing ? (
													<Input
														value={editingProfile.website}
														onChange={(e) =>
															setEditingProfile({
																...editingProfile,
																website: e.target.value,
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
														{userProfile.website}
													</Text>
												)}
											</FormControl>

											<FormControl>
												<FormLabel fontSize="sm" color={mutedColor}>
													所在地
												</FormLabel>
												{isEditing ? (
													<Input
														value={editingProfile.location}
														onChange={(e) =>
															setEditingProfile({
																...editingProfile,
																location: e.target.value,
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
														{userProfile.location}
													</Text>
												)}
											</FormControl>

											<FormControl>
												<FormLabel fontSize="sm" color={mutedColor}>
													生年月日
												</FormLabel>
												{isEditing ? (
													<Input
														type="date"
														value={editingProfile.birthday}
														onChange={(e) =>
															setEditingProfile({
																...editingProfile,
																birthday: e.target.value,
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
														{new Date(userProfile.birthday).toLocaleDateString(
															"ja-JP",
														)}
													</Text>
												)}
											</FormControl>
										</Grid>

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
													placeholder="あなたの料理への想いや得意料理について教えてください..."
													bg={useColorModeValue("gray.50", "gray.700")}
													border="1px"
													borderColor={borderColor}
													_focus={{
														borderColor: "orange.400",
														boxShadow: "0 0 0 1px orange.400",
													}}
													rows={4}
												/>
											) : (
												<Text lineHeight="tall" py={2}>
													{userProfile.bio}
												</Text>
											)}
										</FormControl>
									</VStack>
								</CardBody>
							</MotionCard>

							{/* Preferences */}
							<MotionCard
								bg={cardBg}
								shadow="xl"
								borderRadius="2xl"
								w="full"
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
								<CardHeader pb={3}>
									<HStack spacing={3}>
										<Icon as={FaCog} boxSize={5} color="orange.400" />
										<Text fontSize="xl" fontWeight="bold" color={textColor}>
											設定・環境設定
										</Text>
									</HStack>
								</CardHeader>
								<CardBody pt={0}>
									<VStack spacing={6}>
										<HStack justify="space-between" w="full">
											<HStack spacing={3}>
												<Icon as={FaBell} color="blue.400" />
												<VStack align="start" spacing={0}>
													<Text fontWeight="medium">通知を受け取る</Text>
													<Text fontSize="sm" color={mutedColor}>
														新しいレシピやアップデートの通知
													</Text>
												</VStack>
											</HStack>
											<Switch
												isChecked={editingProfile.preferences.notifications}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														preferences: {
															...editingProfile.preferences,
															notifications: e.target.checked,
														},
													})
												}
												colorScheme="orange"
												size="lg"
												isDisabled={!isEditing}
											/>
										</HStack>

										<HStack justify="space-between" w="full">
											<HStack spacing={3}>
												<Icon as={FaPalette} color="purple.400" />
												<VStack align="start" spacing={0}>
													<Text fontWeight="medium">ダークモード</Text>
													<Text fontSize="sm" color={mutedColor}>
														暗いテーマを使用する
													</Text>
												</VStack>
											</HStack>
											<Switch
												isChecked={editingProfile.preferences.darkMode}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														preferences: {
															...editingProfile.preferences,
															darkMode: e.target.checked,
														},
													})
												}
												colorScheme="orange"
												size="lg"
												isDisabled={!isEditing}
											/>
										</HStack>

										<HStack justify="space-between" w="full" align="center">
											<HStack spacing={3}>
												<Icon as={FaLanguage} color="green.400" />
												<VStack align="start" spacing={0}>
													<Text fontWeight="medium">言語設定</Text>
													<Text fontSize="sm" color={mutedColor}>
														表示言語を選択
													</Text>
												</VStack>
											</HStack>
											<Select
												value={editingProfile.preferences.language}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														preferences: {
															...editingProfile.preferences,
															language: e.target.value,
														},
													})
												}
												w="120px"
												size="sm"
												bg={useColorModeValue("gray.50", "gray.700")}
												isDisabled={!isEditing}
											>
												<option value="ja">日本語</option>
												<option value="en">English</option>
												<option value="ko">한국어</option>
												<option value="zh">中文</option>
											</Select>
										</HStack>
									</VStack>
								</CardBody>
							</MotionCard>
						</VStack>
					</Grid>
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
