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
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	Tag,
	TagCloseButton,
	TagLabel,
	Text,
	Textarea,
	VStack,
	Wrap,
	WrapItem,
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
	FaPlus,
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
	const [newIngredient, setNewIngredient] = useState("");

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
		servingSize: null,
		saltPreference: null,
		sweetnessPreference: null,
		spicinessPreference: null,
		cookingTimePreference: null,
		mealPurpose: null,
		dislikedIngredients: null,
		preferenceTrend: null,
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
				servingSize: user.servingSize || null,
				saltPreference: user.saltPreference || null,
				sweetnessPreference: user.sweetnessPreference || null,
				spicinessPreference: user.spicinessPreference || null,
				cookingTimePreference: user.cookingTimePreference || null,
				mealPurpose: user.mealPurpose || null,
				dislikedIngredients: user.dislikedIngredients || null,
				preferenceTrend: user.preferenceTrend || null,
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
				servingSize: user.servingSize || null,
				saltPreference: user.saltPreference || null,
				sweetnessPreference: user.sweetnessPreference || null,
				spicinessPreference: user.spicinessPreference || null,
				cookingTimePreference: user.cookingTimePreference || null,
				mealPurpose: user.mealPurpose || null,
				dislikedIngredients: user.dislikedIngredients || null,
				preferenceTrend: user.preferenceTrend || null,
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
				servingSize: user.servingSize || null,
				saltPreference: user.saltPreference || null,
				sweetnessPreference: user.sweetnessPreference || null,
				spicinessPreference: user.spicinessPreference || null,
				cookingTimePreference: user.cookingTimePreference || null,
				mealPurpose: user.mealPurpose || null,
				dislikedIngredients: user.dislikedIngredients || null,
				preferenceTrend: user.preferenceTrend || null,
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
				serving_size: editingProfile.servingSize,
				salt_preference: editingProfile.saltPreference,
				sweetness_preference: editingProfile.sweetnessPreference,
				spiciness_preference: editingProfile.spicinessPreference,
				cooking_time_preference: editingProfile.cookingTimePreference,
				meal_purpose: editingProfile.mealPurpose,
				disliked_ingredients: editingProfile.dislikedIngredients,
				preference_trend: editingProfile.preferenceTrend,
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

	// Helper functions for managing disliked ingredients
	const getDislikedIngredientsArray = (
		dislikedIngredients: string | null,
	): string[] => {
		if (!dislikedIngredients || dislikedIngredients.trim() === "") return [];
		return dislikedIngredients
			.split(",")
			.map((item) => item.trim())
			.filter((item) => item !== "");
	};

	const setDislikedIngredientsFromArray = (ingredients: string[]): string => {
		return ingredients.filter((item) => item.trim() !== "").join(",");
	};

	const addDislikedIngredient = (ingredient: string) => {
		if (!ingredient.trim()) return;
		const currentIngredients = getDislikedIngredientsArray(
			editingProfile.dislikedIngredients,
		);
		if (!currentIngredients.includes(ingredient.trim())) {
			const newIngredients = [...currentIngredients, ingredient.trim()];
			setEditingProfile({
				...editingProfile,
				dislikedIngredients: setDislikedIngredientsFromArray(newIngredients),
			});
		}
		setNewIngredient("");
	};

	const removeDislikedIngredient = (ingredient: string) => {
		const currentIngredients = getDislikedIngredientsArray(
			editingProfile.dislikedIngredients,
		);
		const newIngredients = currentIngredients.filter(
			(item) => item !== ingredient,
		);
		setEditingProfile({
			...editingProfile,
			dislikedIngredients: setDislikedIngredientsFromArray(newIngredients),
		});
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addDislikedIngredient(newIngredient);
		}
	};

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			<Header />

			<Container maxW="6xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
				<VStack spacing={{ base: 6, md: 8 }} align="stretch">
					{/* Header with animations */}
					<MotionBox
						initial={{ opacity: 0, y: -50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						<VStack spacing={4} align="stretch">
							<HStack
								justify="space-between"
								align={{ base: "flex-start", md: "center" }}
								mb={2}
								flexDir={{ base: "column", md: "row" }}
								spacing={{ base: 3, md: 0 }}
							>
								<HStack spacing={3}>
									<Icon
										as={FaUser}
										boxSize={{ base: 6, md: 8 }}
										color="orange.400"
									/>
									<VStack align="start" spacing={0}>
										<Text
											fontSize={{ base: "2xl", md: "3xl" }}
											fontWeight="bold"
											color={textColor}
										>
											プロフィール
										</Text>
										<Text
											color={mutedColor}
											fontSize={{ base: "sm", md: "md" }}
										>
											あなたの情報を管理・編集できます
										</Text>
									</VStack>
									<Icon
										as={HiSparkles}
										boxSize={5}
										color="yellow.400"
										display={{ base: "none", md: "block" }}
									/>
								</HStack>

								<AnimatePresence mode="wait">
									{!isEditing ? (
										<MotionButton
											key="edit"
											leftIcon={<FaEdit />}
											colorScheme="orange"
											variant="solid"
											size={{ base: "md", md: "lg" }}
											onClick={handleEdit}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											w={{ base: "full", md: "auto" }}
										>
											編集
										</MotionButton>
									) : (
										<HStack spacing={3} w={{ base: "full", md: "auto" }}>
											<MotionButton
												key="cancel"
												leftIcon={<FaTimes />}
												variant="ghost"
												size={{ base: "md", md: "lg" }}
												onClick={handleCancel}
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 20 }}
												whileHover={{ scale: 1.05 }}
												flex={{ base: 1, md: "none" }}
											>
												キャンセル
											</MotionButton>
											<MotionButton
												key="save"
												leftIcon={<FaSave />}
												colorScheme="green"
												size={{ base: "md", md: "lg" }}
												onClick={handleSave}
												isLoading={isLoading}
												loadingText="保存中..."
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 20 }}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												flex={{ base: 1, md: "none" }}
											>
												保存
											</MotionButton>
										</HStack>
									)}
								</AnimatePresence>
							</HStack>
							<Divider borderColor={borderColor} />
						</VStack>
					</MotionBox>
					{/* Single Column Layout */}
					<VStack spacing={{ base: 4, md: 6 }} maxW="4xl" mx="auto">
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
									<Text
										fontSize={{ base: "lg", md: "xl" }}
										fontWeight="bold"
										color={textColor}
									>
										基本情報
									</Text>
								</HStack>
							</CardHeader>
							<CardBody pt={0}>
								<VStack spacing={{ base: 6, md: 8 }}>
									{/* Avatar Section */}
									<VStack spacing={4}>
										<Box position="relative">
											<Avatar
												size={{ base: "xl", md: "2xl" }}
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
										gap={{ base: 4, md: 6 }}
										w="full"
									>
										<FormControl>
											<FormLabel
												fontSize={{ base: "xs", md: "sm" }}
												color={mutedColor}
											>
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
													size={{ base: "md", md: "lg" }}
													_focus={{
														borderColor: "orange.400",
														boxShadow: "0 0 0 1px orange.400",
													}}
												/>
											) : (
												<Text
													fontWeight="medium"
													py={2}
													fontSize={{ base: "sm", md: "md" }}
												>
													{user?.name || "未設定"}
												</Text>
											)}
										</FormControl>

										<FormControl>
											<FormLabel
												fontSize={{ base: "xs", md: "sm" }}
												color={mutedColor}
											>
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
													size={{ base: "md", md: "lg" }}
													_focus={{
														borderColor: "orange.400",
														boxShadow: "0 0 0 1px orange.400",
													}}
												/>
											) : (
												<Text
													fontWeight="medium"
													py={2}
													fontSize={{ base: "sm", md: "md" }}
												>
													{user?.email || "未設定"}
												</Text>
											)}
										</FormControl>
									</Grid>

									{/* Bio Section - Full Width */}
									<FormControl>
										<FormLabel
											fontSize={{ base: "xs", md: "sm" }}
											color={mutedColor}
										>
											自己紹介
										</FormLabel>
										{isEditing ? (
											<Textarea
												value={editingProfile.bio || ""}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														bio: e.target.value,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												size={{ base: "md", md: "lg" }}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												rows={4}
												resize="vertical"
												placeholder="自己紹介を入力してください"
											/>
										) : (
											<Text
												color={mutedColor}
												fontSize={{ base: "xs", md: "sm" }}
												lineHeight="tall"
												p={2}
											>
												{user?.bio || "未設定"}
											</Text>
										)}
									</FormControl>
								</VStack>
							</CardBody>
						</MotionCard>

						{/* Cooking Preferences */}
						<MotionCard
							bg={cardBg}
							shadow="xl"
							borderRadius="2xl"
							w="full"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
						>
							<CardHeader pb={3}>
								<HStack spacing={3}>
									<Icon as={HiSparkles} boxSize={5} color="pink.400" />
									<Text
										fontSize={{ base: "lg", md: "xl" }}
										fontWeight="bold"
										color={textColor}
									>
										料理の好み設定
									</Text>
								</HStack>
							</CardHeader>
							<CardBody pt={0}>
								<Grid
									templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
									gap={{ base: 4, md: 6 }}
									w="full"
								>
									{/* Serving Size */}
									<FormControl>
										<FormLabel
											fontSize={{ base: "xs", md: "sm" }}
											color={mutedColor}
										>
											人数
										</FormLabel>
										{isEditing ? (
											<Select
												value={editingProfile.servingSize || ""}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														servingSize: e.target.value
															? Number(e.target.value)
															: null,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												size={{ base: "md", md: "lg" }}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												placeholder="人数を選択"
											>
												<option value="1">1人分</option>
												<option value="2">2人分</option>
												<option value="3">3人分</option>
												<option value="4">4人分</option>
												<option value="5">5人分</option>
												<option value="6">6人分以上</option>
											</Select>
										) : (
											<Text
												fontWeight="medium"
												py={2}
												fontSize={{ base: "sm", md: "md" }}
											>
												{user?.servingSize
													? `${user.servingSize}人分`
													: "未設定"}
											</Text>
										)}
									</FormControl>

									{/* Salt Preference */}
									<FormControl>
										<FormLabel
											fontSize={{ base: "xs", md: "sm" }}
											color={mutedColor}
										>
											塩分の好み
										</FormLabel>
										{isEditing ? (
											<Select
												value={editingProfile.saltPreference || ""}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														saltPreference: e.target.value || null,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												size={{ base: "md", md: "lg" }}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												placeholder="塩分の好みを選択"
											>
												<option value="薄味">薄味</option>
												<option value="普通">普通</option>
												<option value="濃いめ">濃いめ</option>
											</Select>
										) : (
											<Text
												fontWeight="medium"
												py={2}
												fontSize={{ base: "sm", md: "md" }}
											>
												{user?.saltPreference || "未設定"}
											</Text>
										)}
									</FormControl>

									{/* Sweetness Preference */}
									<FormControl>
										<FormLabel
											fontSize={{ base: "xs", md: "sm" }}
											color={mutedColor}
										>
											甘さの好み
										</FormLabel>
										{isEditing ? (
											<Select
												value={editingProfile.sweetnessPreference || ""}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														sweetnessPreference: e.target.value || null,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												size={{ base: "md", md: "lg" }}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												placeholder="甘さの好みを選択"
											>
												<option value="控えめ">控えめ</option>
												<option value="普通">普通</option>
												<option value="甘め">甘め</option>
											</Select>
										) : (
											<Text
												fontWeight="medium"
												py={2}
												fontSize={{ base: "sm", md: "md" }}
											>
												{user?.sweetnessPreference || "未設定"}
											</Text>
										)}
									</FormControl>

									{/* Spiciness Preference */}
									<FormControl>
										<FormLabel fontSize="sm" color={mutedColor}>
											辛さの好み
										</FormLabel>
										{isEditing ? (
											<Select
												value={editingProfile.spicinessPreference || ""}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														spicinessPreference: e.target.value || null,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												placeholder="辛さの好みを選択"
											>
												<option value="辛くない">辛くない</option>
												<option value="少し辛い">少し辛い</option>
												<option value="普通">普通</option>
												<option value="辛め">辛め</option>
												<option value="とても辛い">とても辛い</option>
											</Select>
										) : (
											<Text fontWeight="medium" py={2}>
												{user?.spicinessPreference || "未設定"}
											</Text>
										)}
									</FormControl>

									{/* Cooking Time Preference */}
									<FormControl>
										<FormLabel fontSize="sm" color={mutedColor}>
											料理時間の好み
										</FormLabel>
										{isEditing ? (
											<Select
												value={editingProfile.cookingTimePreference || ""}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														cookingTimePreference: e.target.value || null,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												placeholder="料理時間の好みを選択"
											>
												<option value="15分以内">15分以内</option>
												<option value="30分以内">30分以内</option>
												<option value="1時間以内">1時間以内</option>
												<option value="1時間以上">1時間以上</option>
												<option value="時間は気にしない">
													時間は気にしない
												</option>
											</Select>
										) : (
											<Text fontWeight="medium" py={2}>
												{user?.cookingTimePreference || "未設定"}
											</Text>
										)}
									</FormControl>

									{/* Meal Purpose */}
									<FormControl>
										<FormLabel fontSize="sm" color={mutedColor}>
											食事の目的
										</FormLabel>
										{isEditing ? (
											<Select
												value={editingProfile.mealPurpose || ""}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														mealPurpose: e.target.value || null,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												placeholder="食事の目的を選択"
											>
												<option value="日常の食事">日常の食事</option>
												<option value="ダイエット">ダイエット</option>
												<option value="筋トレ・健康">筋トレ・健康</option>
												<option value="おもてなし">おもてなし</option>
												<option value="お弁当">お弁当</option>
												<option value="パーティー">パーティー</option>
											</Select>
										) : (
											<Text fontWeight="medium" py={2}>
												{user?.mealPurpose || "未設定"}
											</Text>
										)}
									</FormControl>

									{/* Preferred Trend */}
									<FormControl>
										<FormLabel fontSize="sm" color={mutedColor}>
											好みのトレンド
										</FormLabel>
										{isEditing ? (
											<Select
												value={editingProfile.preferenceTrend || ""}
												onChange={(e) =>
													setEditingProfile({
														...editingProfile,
														preferenceTrend: e.target.value || null,
													})
												}
												bg={useColorModeValue("gray.50", "gray.700")}
												border="1px"
												borderColor={borderColor}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
												}}
												placeholder="好みのトレンドを選択"
											>
												<option value="和食">和食</option>
												<option value="洋食">洋食</option>
												<option value="中華">中華</option>
												<option value="韓国料理">韓国料理</option>
												<option value="イタリアン">イタリアン</option>
												<option value="フレンチ">フレンチ</option>
												<option value="タイ料理">タイ料理</option>
												<option value="インド料理">インド料理</option>
												<option value="メキシカン">メキシカン</option>
												<option value="ヴィーガン">ヴィーガン</option>
												<option value="グルテンフリー">グルテンフリー</option>
											</Select>
										) : (
											<Text fontWeight="medium" py={2}>
												{user?.preferenceTrend || "未設定"}
											</Text>
										)}
									</FormControl>

									{/* Disliked Ingredients */}
									<FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
										<FormLabel fontSize="sm" color={mutedColor}>
											苦手な食材
											<Text as="span" fontSize="xs" color="gray.500" ml={2}>
												（例：にんじん、ピーマン など）
											</Text>
										</FormLabel>
										{isEditing ? (
											<VStack align="stretch" spacing={3}>
												{/* Add ingredient input */}
												<HStack>
													<Input
														value={newIngredient}
														onChange={(e) => setNewIngredient(e.target.value)}
														onKeyPress={handleKeyPress}
														placeholder="苦手な食材を入力"
														bg={useColorModeValue("gray.50", "gray.700")}
														border="1px"
														borderColor={borderColor}
														_focus={{
															borderColor: "orange.400",
															boxShadow: "0 0 0 1px orange.400",
														}}
														size="sm"
													/>
													<IconButton
														aria-label="食材を追加"
														icon={<FaPlus />}
														size="sm"
														colorScheme="orange"
														onClick={() => addDislikedIngredient(newIngredient)}
														isDisabled={!newIngredient.trim()}
													/>
												</HStack>

												{/* Display current ingredients as tags */}
												<Wrap spacing={2}>
													{getDislikedIngredientsArray(
														editingProfile.dislikedIngredients,
													).map((ingredient, index) => (
														<WrapItem key={index}>
															<Tag
																size="md"
																colorScheme="red"
																variant="subtle"
																borderRadius="full"
															>
																<TagLabel>{ingredient}</TagLabel>
																<TagCloseButton
																	onClick={() =>
																		removeDislikedIngredient(ingredient)
																	}
																/>
															</Tag>
														</WrapItem>
													))}
												</Wrap>

												{getDislikedIngredientsArray(
													editingProfile.dislikedIngredients,
												).length === 0 && (
													<Text
														fontSize="sm"
														color={mutedColor}
														fontStyle="italic"
													>
														苦手な食材はありません
													</Text>
												)}
											</VStack>
										) : (
											<Box>
												{getDislikedIngredientsArray(
													user?.dislikedIngredients || "",
												).length > 0 ? (
													<Wrap spacing={2}>
														{getDislikedIngredientsArray(
															user?.dislikedIngredients || "",
														).map((ingredient, index) => (
															<WrapItem key={index}>
																<Tag
																	size="md"
																	colorScheme="red"
																	variant="outline"
																	borderRadius="full"
																>
																	<TagLabel>{ingredient}</TagLabel>
																</Tag>
															</WrapItem>
														))}
													</Wrap>
												) : (
													<Text fontWeight="medium" py={2} color={mutedColor}>
														未設定
													</Text>
												)}
											</Box>
										)}
									</FormControl>
								</Grid>

								{/* Additional Info */}
								<Grid
									templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
									gap={4}
									w="full"
									mt={6}
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
