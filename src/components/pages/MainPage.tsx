import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	Container,
	Flex,
	FormControl,
	FormLabel,
	HStack,
	Heading,
	Icon,
	IconButton,
	Image,
	Input,
	InputGroup,
	InputRightElement,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Select,
	SimpleGrid,
	Switch,
	Tag,
	TagLabel,
	Text,
	Textarea,
	VStack,
	Wrap,
	WrapItem,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	FaBookmark,
	FaChevronDown,
	FaChevronLeft,
	FaChevronRight,
	FaChevronUp,
	FaCog,
	FaFilter,
	FaSearch,
	FaSort,
	FaStar,
	FaVideo,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router";

import YouTubeThumbnail from "@/components/atoms/YouTubeThumbnail";
import Header from "@/components/organisms/Header";
import {
	externalServiceAtomLoadable,
	recipeListAtomLoadable,
	recipeQueryParamAtom,
	recipeSortParamAtom,
	recipeUrlAtom,
} from "@/lib/atom/RecipeAtom";
import { updateUserRecipeAtom, userAtom } from "@/lib/atom/UserAtom";
import { type UserRecipe, getUserRecipes } from "@/lib/domain/UserQuery";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";
import type { RecipeParameters } from "@/lib/type/RecipeParameters";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function MainPage() {
	const navigate = useNavigate();
	const [urlInput, setUrlInput] = useAtom(recipeUrlAtom);
	const [recipeQueryParam, setRecipeQueryParam] = useAtom(recipeQueryParamAtom);
	const [recipeSortParam, setRecipeSortParam] = useAtom(recipeSortParamAtom);

	const toast = useToast();

	// カスタム生成設定の状態管理
	const [useCustomGeneration, setUseCustomGeneration] = useState(false);
	const [showCustomSettings, setShowCustomSettings] = useState(false);
	const [recipeParams, setRecipeParams] = useState<RecipeParameters>({
		peopleCount: "レシピ通り",
		cookingTime: "レシピ通り",
		preference: "レシピ通り",
		saltiness: "レシピ通り",
		sweetness: "レシピ通り",
		spiciness: "レシピ通り",
		dislikedIngredients: "",
	});

	// ユーザー情報を取得してデフォルト値を設定
	const user = useAtomValue(userAtom);

	/**
	 * ユーザープロファイルからRecipeParametersの初期値を作成
	 */
	const createInitialRecipeParamsFromUser = (user: any): RecipeParameters => {
		return {
			// ProfilePageのservingSizeから人数を設定
			peopleCount:
				user?.servingSize &&
				["1", "2", "3", "4", "5", "6"].includes(String(user.servingSize))
					? (String(user.servingSize) as "1" | "2" | "3" | "4" | "5" | "6")
					: "レシピ通り",

			// ProfilePageのcookingTimePreferenceから調理時間を設定
			cookingTime:
				user?.cookingTimePreference === "15分以内"
					? "15分以内"
					: user?.cookingTimePreference === "30分以内"
						? "30分以内"
						: user?.cookingTimePreference === "1時間以内"
							? "1時間以内"
							: "レシピ通り",

			// ProfilePageのpreferenceTrendから重視する傾向を設定
			preference:
				user?.preferenceTrend === "栄養重視"
					? "栄養重視"
					: user?.preferenceTrend === "見栄え重視"
						? "見栄え重視"
						: user?.preferenceTrend === "コスパ重視"
							? "コスパ重視"
							: user?.preferenceTrend === "タイパ重視"
								? "タイパ重視"
								: "レシピ通り",

			// ProfilePageのsaltPreferenceから塩味を設定
			saltiness:
				user?.saltPreference === "濃いめ"
					? "濃いめ"
					: user?.saltPreference === "普通"
						? "普通"
						: user?.saltPreference === "薄味"
							? "薄味"
							: "レシピ通り",

			// ProfilePageのsweetnessPreferenceから甘味を設定
			sweetness:
				user?.sweetnessPreference === "甘め"
					? "甘め"
					: user?.sweetnessPreference === "普通"
						? "普通"
						: user?.sweetnessPreference === "控えめ"
							? "控えめ"
							: "レシピ通り",

			// ProfilePageのspicinessPreferenceから辛味を設定
			spiciness:
				user?.spicinessPreference === "とても辛い"
					? "とても辛い"
					: user?.spicinessPreference === "辛め"
						? "辛め"
						: user?.spicinessPreference === "普通"
							? "普通"
							: user?.spicinessPreference === "少し辛い"
								? "少し辛い"
								: user?.spicinessPreference === "辛くない"
									? "辛くない"
									: "レシピ通り",

			// ProfilePageのdislikedIngredientsから嫌いな食材を設定
			dislikedIngredients: user?.dislikedIngredients || "",
		};
	};

	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, orange.900, pink.900, purple.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	const recipes = useLoadableAtom(recipeListAtomLoadable);
	const externalServices = useLoadableAtom(externalServiceAtomLoadable);
	const updateUserRecipe = useSetAtom(updateUserRecipeAtom);
	const [userRecipe, setUserRecipe] = useState<UserRecipe[]>([]);

	const handlePageChange = (newPage: number) => {
		setRecipeQueryParam((prev) => ({
			...prev,
			page: newPage,
		}));
	};

	const handleUrlSubmit = () => {
		//youtube shorts以外を受け付けない→
		// YouTube ShortsのURLパターンをチェックする正規表現
		// youtube.com/shorts/ または youtu.be/ に続く11桁の英数字（動画ID）をチェックします。
		const youtubeShortsRegex =
			/^(https?:\/\/)?(www\.)?(youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})(\?.*)?$/;

		if (!urlInput.trim()) {
			toast({
				title: "Youtube ShortsのURLを入力してください",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}
		// 入力されたURLがYouTube Shortsの正規表現に一致するかをチェック
		if (!youtubeShortsRegex.test(urlInput)) {
			toast({
				title:
					"有効なYouTube ShortsのURLではありません。Shortsのリンクのみを受け付けています。",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		// AI分析ページに遷移（カスタム設定も含める）
		const encodedUrl = encodeURIComponent(urlInput);
		const finalRecipeParams = useCustomGeneration
			? recipeParams
			: createInitialRecipeParamsFromUser(user);

		navigate(`/home/ai-gen?url=${encodedUrl}`, {
			state: {
				recipeParams: finalRecipeParams,
			},
		});
	};

	const fetchData = async () => {
		if (recipes?.items) {
			const recipeIds = recipes.items.map((recipe) => recipe.id).join(",");
			const userRecipes = await getUserRecipes(recipeIds);
			setUserRecipe(userRecipes);
		}
	};

	const toggleBookmark = (recipeId: number, isFavorite: boolean) => {
		updateUserRecipe(recipeId, {
			is_favorite: !isFavorite,
		});
		// ローカルのuserRecipeを更新
		setUserRecipe((prev) =>
			prev.map((ur) =>
				ur.recipeId === recipeId ? { ...ur, isFavorite: !isFavorite } : ur,
			),
		);
		if (isFavorite) {
			// 既にブックマークされている場合は解除
			toast({
				title: "ブックマークを解除しました",
				status: "info",
				duration: 2000,
				isClosable: true,
			});
		} else {
			// ブックマークされていない場合は追加
			toast({
				title: "ブックマークに追加しました",
				status: "success",
				duration: 2000,
				isClosable: true,
			});
		}
	};

	const updateRating = (recipeId: number, newRating: number) => {
		updateUserRecipe(recipeId, {
			rating: newRating,
		});
		// ローカルのuserRecipeを更新
		setUserRecipe((prev) =>
			prev.map((ur) =>
				ur.recipeId === recipeId ? { ...ur, rating: newRating } : ur,
			),
		);
		toast({
			title: "評価を更新しました",
			description: `${newRating}つ星の評価をつけました`,
			status: "success",
			duration: 2000,
			isClosable: true,
		});
	};

	const handleSortChange = (
		sortBy: "created_date" | "updated_date" | "recipe_name" | "rating" | null,
		orderBy: "asc" | "desc" | null,
	) => {
		setRecipeSortParam({
			sorted_by: sortBy,
			order_by: orderBy,
		});
		// ページを1に戻す
		setRecipeQueryParam((prev) => ({
			...prev,
			page: 1,
		}));
	};

	const toggleFavoriteOnly = () => {
		setRecipeQueryParam((prev) => ({
			...prev,
			favorite_only: !prev.favorite_only,
			page: 1, // ページを1に戻す
		}));
	};

	useEffect(() => {
		fetchData();
	}, [recipes]);

	// ユーザー情報が変更されたときにデフォルト値を更新
	useEffect(() => {
		if (user && !useCustomGeneration) {
			setRecipeParams(createInitialRecipeParamsFromUser(user));
		}
	}, [user, useCustomGeneration]);

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			<Header />

			<Container maxW="7xl" py={8}>
				{/* ウェルカムセクション */}
				<MotionBox
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					mb={12}
				>
					<VStack spacing={6} textAlign="center">
						<HStack>
							<Image
								src="/bae-recipe/favicon.svg"
								alt="BAE Recipe Logo"
								boxSize={8}
							/>
							<Heading
								size="xl"
								bgGradient="linear(to-r, orange.500, pink.500)"
								bgClip="text"
							>
								あなたのレシピコレクション
							</Heading>
						</HStack>
						<Text fontSize="lg" color={textColor} maxW="2xl">
							動画URLを入力してAIでレシピを自動生成するか、
							既存のレシピから選んで「映える献立」を作りましょう
						</Text>
					</VStack>
				</MotionBox>

				{/* URL入力セクション */}
				<MotionBox
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					mb={12}
				>
					<Box
						bg={cardBg}
						p={8}
						rounded="2xl"
						shadow="xl"
						border="1px"
						borderColor={borderColor}
						maxW="4xl"
						mx="auto"
					>
						<VStack spacing={6}>
							{" "}
							<HStack>
								<Icon
									as={FaVideo}
									boxSize={{ base: 5, md: 6 }}
									color="purple.500"
								/>
								<Heading
									size={{ base: "sm", md: "md" }}
									color={useColorModeValue("gray.800", "white")}
									fontSize={{ base: "lg", md: "xl" }}
								>
									動画レシピをAIで分析
								</Heading>
								<Icon
									as={HiSparkles}
									boxSize={{ base: 4, md: 5 }}
									color="pink.500"
								/>
							</HStack>
							<Text
								color={textColor}
								textAlign="center"
								fontSize={{ base: "sm", md: "md" }}
								px={{ base: 2, md: 0 }}
							>
								YouTube
								Shortsの動画URLを入力すると、AIが自動でレシピを抽出・整理します
							</Text>
							<Flex
								w="full"
								gap={4}
								direction={{ base: "column", md: "row" }}
								align={{ base: "stretch", md: "center" }}
							>
								<InputGroup
									flex={{ base: "none", md: 1 }}
									w={{ base: "full", md: "auto" }}
								>
									<Input
										placeholder="https://youtube.com/shorts/..."
										value={urlInput}
										onChange={(e) => setUrlInput(e.target.value)}
										size="lg"
										bg={useColorModeValue("gray.50", "gray.700")}
										border="2px"
										borderColor={useColorModeValue("gray.200", "gray.600")}
										_focus={{
											borderColor: "orange.400",
											boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)",
										}}
									/>
									<InputRightElement height="100%">
										<Icon as={FaSearch} color="gray.400" />
									</InputRightElement>
								</InputGroup>
								<Button
									size="lg"
									w={{ base: "full", md: "auto" }}
									flexShrink={0}
									bgGradient="linear(to-r, orange.400, pink.400)"
									color="white"
									_hover={{
										bgGradient: "linear(to-r, orange.500, pink.500)",
										transform: "translateY(-2px)",
										shadow: "lg",
									}}
									leftIcon={<Icon as={HiSparkles} />}
									onClick={handleUrlSubmit}
									transition="all 0.3s"
									px={8}
								>
									AI分析開始
								</Button>
							</Flex>
							{/* カスタム生成設定トグル */}
							<Flex justify="space-between" align="center" w="full">
								<HStack spacing={3}>
									<Icon as={FaCog} color="orange.500" />
									<Text
										fontWeight="medium"
										color={useColorModeValue("gray.700", "gray.300")}
									>
										カスタム生成設定
									</Text>
								</HStack>
								<HStack spacing={2}>
									<Switch
										colorScheme="orange"
										isChecked={useCustomGeneration}
										onChange={(e) => {
											setUseCustomGeneration(e.target.checked);
											if (e.target.checked) {
												setShowCustomSettings(true);
											} else {
												setShowCustomSettings(false);
												// プロファイルの設定に戻す
												setRecipeParams(
													createInitialRecipeParamsFromUser(user),
												);
											}
										}}
									/>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowCustomSettings(!showCustomSettings)}
										rightIcon={
											<Icon
												as={showCustomSettings ? FaChevronUp : FaChevronDown}
												transition="transform 0.2s"
											/>
										}
										isDisabled={!useCustomGeneration}
									>
										詳細設定
									</Button>
								</HStack>
							</Flex>
							{/* カスタム設定アコーディオン */}
							<AnimatePresence>
								{useCustomGeneration && showCustomSettings && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.3 }}
										style={{ overflow: "hidden", width: "100%" }}
									>
										<Box
											p={6}
											bg={useColorModeValue("gray.50", "gray.700")}
											rounded="lg"
											border="1px"
											borderColor={useColorModeValue("gray.200", "gray.600")}
											w="full"
										>
											<VStack spacing={4} align="stretch">
												<Text
													fontWeight="semibold"
													color={useColorModeValue("gray.800", "white")}
												>
													レシピ生成の詳細設定
												</Text>

												{/* 主要な3つのプルダウンを横並び */}
												<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
													{/* 人数設定 */}
													<FormControl>
														<FormLabel fontSize="sm">食べる人数</FormLabel>
														<Select
															value={recipeParams.peopleCount}
															onChange={(e) =>
																setRecipeParams((prev) => ({
																	...prev,
																	peopleCount: e.target.value as any,
																}))
															}
															size="sm"
														>
															<option value="1">1人</option>
															<option value="2">2人</option>
															<option value="3">3人</option>
															<option value="4">4人</option>
															<option value="5">5人</option>
															<option value="6">6人</option>
															<option value="レシピ通り">レシピ通り</option>
														</Select>
													</FormControl>

													{/* 調理時間 */}
													<FormControl>
														<FormLabel fontSize="sm">調理時間</FormLabel>
														<Select
															value={recipeParams.cookingTime}
															onChange={(e) =>
																setRecipeParams((prev) => ({
																	...prev,
																	cookingTime: e.target.value as any,
																}))
															}
															size="sm"
														>
															<option value="15分以内">15分以内</option>
															<option value="30分以内">30分以内</option>
															<option value="1時間以内">1時間以内</option>
															<option value="レシピ通り">レシピ通り</option>
														</Select>
													</FormControl>

													{/* 重視する傾向 */}
													<FormControl>
														<FormLabel fontSize="sm">重視する傾向</FormLabel>
														<Select
															value={recipeParams.preference}
															onChange={(e) =>
																setRecipeParams((prev) => ({
																	...prev,
																	preference: e.target.value as any,
																}))
															}
															size="sm"
														>
															<option value="栄養重視">栄養重視</option>
															<option value="見栄え重視">見栄え重視</option>
															<option value="コスパ重視">コスパ重視</option>
															<option value="タイパ重視">タイパ重視</option>
															<option value="レシピ通り">レシピ通り</option>
														</Select>
													</FormControl>
												</SimpleGrid>

												{/* 味付けの設定を別のセクション */}
												<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
													{/* 塩味 */}
													<FormControl>
														<FormLabel fontSize="sm">塩味</FormLabel>
														<Select
															value={recipeParams.saltiness}
															onChange={(e) =>
																setRecipeParams((prev) => ({
																	...prev,
																	saltiness: e.target.value as any,
																}))
															}
															size="sm"
														>
															<option value="濃いめ">濃いめ</option>
															<option value="普通">普通</option>
															<option value="薄味">薄味</option>
															<option value="レシピ通り">レシピ通り</option>
														</Select>
													</FormControl>

													{/* 甘味 */}
													<FormControl>
														<FormLabel fontSize="sm">甘味</FormLabel>
														<Select
															value={recipeParams.sweetness}
															onChange={(e) =>
																setRecipeParams((prev) => ({
																	...prev,
																	sweetness: e.target.value as any,
																}))
															}
															size="sm"
														>
															<option value="甘め">甘め</option>
															<option value="普通">普通</option>
															<option value="控えめ">控えめ</option>
															<option value="レシピ通り">レシピ通り</option>
														</Select>
													</FormControl>

													{/* 辛味 */}
													<FormControl>
														<FormLabel fontSize="sm">辛み</FormLabel>
														<Select
															value={recipeParams.spiciness}
															onChange={(e) =>
																setRecipeParams((prev) => ({
																	...prev,
																	spiciness: e.target.value as any,
																}))
															}
															size="sm"
														>
															<option value="とても辛い">とても辛い</option>
															<option value="辛め">辛め</option>
															<option value="普通">普通</option>
															<option value="少し辛い">少し辛い</option>
															<option value="辛くない">辛くない</option>
															<option value="レシピ通り">レシピ通り</option>
														</Select>
													</FormControl>
												</SimpleGrid>

												{/* 嫌いな食材 */}
												<FormControl>
													<FormLabel fontSize="sm">嫌いな食材</FormLabel>
													<Textarea
														value={recipeParams.dislikedIngredients}
														onChange={(e) =>
															setRecipeParams((prev) => ({
																...prev,
																dislikedIngredients: e.target.value,
															}))
														}
														placeholder="嫌いな食材を入力してください（例：なす、ピーマン、セロリなど）"
														size="sm"
														resize="vertical"
														minH="80px"
													/>
												</FormControl>
											</VStack>
										</Box>
									</motion.div>
								)}
							</AnimatePresence>
						</VStack>
					</Box>
				</MotionBox>

				{/* レシピ一覧セクション */}
				<MotionBox
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					{" "}
					<Flex
						justify="space-between"
						align={{ base: "stretch", md: "center" }}
						mb={8}
						direction={{ base: "column", md: "row" }}
						gap={{ base: 4, md: 0 }}
					>
						<VStack align={{ base: "center", md: "start" }} spacing={2}>
							<Heading
								size={{ base: "md", md: "lg" }}
								color={useColorModeValue("gray.800", "white")}
								textAlign={{ base: "center", md: "left" }}
							>
								あなたのレシピ
							</Heading>
							<Text
								color={textColor}
								fontSize={{ base: "sm", md: "md" }}
								textAlign={{ base: "center", md: "left" }}
							>
								{recipes?.total}個のレシピが保存されています
								{recipeQueryParam.keyword && (
									<Text as="span" color="orange.500" fontWeight="medium" ml={2}>
										「{recipeQueryParam.keyword}」で検索中
									</Text>
								)}
								{recipeQueryParam.favorite_only && (
									<Text as="span" color="pink.500" fontWeight="medium" ml={2}>
										（ブックマークのみ）
									</Text>
								)}
							</Text>
						</VStack>

						{/* Sort and Filter Controls */}
						<HStack
							spacing={3}
							align="center"
							justify={{ base: "center", md: "flex-end" }}
							flexWrap="wrap"
						>
							{/* お気に入りフィルター */}
							<Button
								leftIcon={<Icon as={FaBookmark} />}
								variant={recipeQueryParam.favorite_only ? "solid" : "outline"}
								colorScheme="orange"
								size={{ base: "sm", md: "md" }}
								onClick={toggleFavoriteOnly}
								_hover={{
									transform: "translateY(-1px)",
									shadow: "md",
								}}
								transition="all 0.2s"
							>
								ブックマークのみ
							</Button>

							{/* ソートメニュー */}
							<Menu>
								<MenuButton
									as={Button}
									rightIcon={<Icon as={FaChevronDown} />}
									leftIcon={<Icon as={FaSort} />}
									variant="outline"
									colorScheme="orange"
									size={{ base: "sm", md: "md" }}
									_hover={{
										transform: "translateY(-1px)",
										shadow: "md",
									}}
									transition="all 0.2s"
								>
									{recipeSortParam.sorted_by
										? `${
												recipeSortParam.sorted_by === "created_date"
													? "作成日"
													: recipeSortParam.sorted_by === "updated_date"
														? "更新日"
														: recipeSortParam.sorted_by === "recipe_name"
															? "レシピ名"
															: recipeSortParam.sorted_by === "rating"
																? "評価"
																: "不明"
											}${recipeSortParam.order_by === "asc" ? " (昇順)" : " (降順)"}`
										: "ソート"}
								</MenuButton>
								<MenuList>
									<MenuItem
										icon={<Icon as={FaSort} />}
										onClick={() => handleSortChange("created_date", "desc")}
									>
										作成日（新しい順）
									</MenuItem>
									<MenuItem
										icon={<Icon as={FaSort} />}
										onClick={() => handleSortChange("created_date", "asc")}
									>
										作成日（古い順）
									</MenuItem>
									<MenuItem
										icon={<Icon as={FaSort} />}
										onClick={() => handleSortChange("updated_date", "desc")}
									>
										更新日（新しい順）
									</MenuItem>
									<MenuItem
										icon={<Icon as={FaSort} />}
										onClick={() => handleSortChange("updated_date", "asc")}
									>
										更新日（古い順）
									</MenuItem>
									<MenuItem
										icon={<Icon as={FaSort} />}
										onClick={() => handleSortChange("recipe_name", "asc")}
									>
										レシピ名（A-Z）
									</MenuItem>
									<MenuItem
										icon={<Icon as={FaSort} />}
										onClick={() => handleSortChange("recipe_name", "desc")}
									>
										レシピ名（Z-A）
									</MenuItem>
									<MenuItem
										icon={<Icon as={FaStar} />}
										onClick={() => handleSortChange("rating", "desc")}
									>
										評価（高い順）
									</MenuItem>
									<MenuItem
										icon={<Icon as={FaStar} />}
										onClick={() => handleSortChange("rating", "asc")}
									>
										評価（低い順）
									</MenuItem>
									<MenuItem
										icon={<Icon as={FaFilter} />}
										onClick={() => handleSortChange(null, null)}
									>
										ソートをクリア
									</MenuItem>
								</MenuList>
							</Menu>
						</HStack>
					</Flex>
					<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
						{recipes?.items && recipes.items.length > 0 ? (
							recipes.items.map((recipe, index) => (
								<MotionCard
									key={recipe.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									whileHover={{ y: -8, transition: { duration: 0.2 } }}
									bg={cardBg}
									shadow="lg"
									rounded="xl"
									overflow="hidden"
									border="1px"
									borderColor={borderColor}
									_hover={{
										shadow: "2xl",
										borderColor: "orange.300",
									}}
									cursor="pointer"
									onClick={() => navigate(`/home/recipe/${recipe.id}`)}
								>
									<Box position="relative">
										<YouTubeThumbnail
											url={recipe.url}
											alt={recipe.recipeName}
											height="200px"
											width="full"
											objectFit="cover"
											onClick={() => {
												if (recipe.url) {
													window.open(
														recipe.url,
														"_blank",
														"noopener,noreferrer",
													);
												}
											}}
										/>
										<IconButton
											aria-label="ブックマーク"
											icon={
												<Icon
													as={FaBookmark}
													color={
														userRecipe.find(
															(ur) =>
																ur.recipeId === recipe.id && ur.isFavorite,
														)
															? "orange.400"
															: "gray.400"
													}
												/>
											}
											position="absolute"
											top={3}
											right={3}
											size="sm"
											bg="white"
											shadow="md"
											rounded="full"
											_hover={{
												transform: "scale(1.1)",
												shadow: "lg",
											}}
											transition="all 0.2s"
											onClick={(e) => {
												e.stopPropagation();
												toggleBookmark(
													recipe.id,
													userRecipe.find(
														(ur) => ur.recipeId === recipe.id && ur.isFavorite,
													)?.isFavorite || false,
												);
											}}
										/>
									</Box>{" "}
									<CardBody p={{ base: 4, md: 6 }}>
										<VStack align="start" spacing={{ base: 3, md: 4 }}>
											<VStack align="start" spacing={2} w="full">
												<Heading
													size={{ base: "sm", md: "md" }}
													noOfLines={2}
													lineHeight={1.3}
													fontSize={{ base: "md", md: "lg" }}
												>
													{recipe.recipeName}
												</Heading>

												{/* Genre Badge */}
												{recipe.genrue && (
													<Badge
														colorScheme="purple"
														variant="subtle"
														fontSize={{ base: "2xs", md: "xs" }}
														px={2}
														py={1}
														rounded="md"
													>
														{recipe.genrue}
													</Badge>
												)}
											</VStack>
											{/* Keywords Tags */}
											{recipe.keyword && (
												<Wrap spacing={1}>
													{recipe.keyword.split(",").map((tag, tagIndex) => (
														<WrapItem key={tagIndex}>
															<Tag
																size={{ base: "sm", md: "md" }}
																colorScheme="orange"
																variant="subtle"
																rounded="full"
															>
																<TagLabel fontSize={{ base: "xs", md: "sm" }}>
																	{tag.trim()}
																</TagLabel>
															</Tag>
														</WrapItem>
													))}{" "}
												</Wrap>
											)}

											{/* Rating Component */}
											{(() => {
												const currentUserRecipe = userRecipe.find(
													(ur) => ur.recipeId === recipe.id,
												);
												const currentRating = currentUserRecipe?.rating || 0;

												return (
													<Box>
														<Text
															fontSize={{ base: "xs", md: "sm" }}
															color={textColor}
															mb={1}
															fontWeight="medium"
														>
															評価:
														</Text>
														<HStack spacing={1}>
															{[1, 2, 3, 4, 5].map((star) => (
																<IconButton
																	key={star}
																	aria-label={`${star}つ星の評価をつける`}
																	icon={
																		<Icon
																			as={FaStar}
																			color={
																				star <= currentRating
																					? "yellow.400"
																					: "gray.300"
																			}
																		/>
																	}
																	size={{ base: "xs", md: "sm" }}
																	variant="ghost"
																	minW="auto"
																	h={{ base: "16px", md: "20px" }}
																	w={{ base: "16px", md: "20px" }}
																	p={0}
																	onClick={(e) => {
																		e.stopPropagation();
																		updateRating(recipe.id, star);
																	}}
																	_hover={{
																		transform: "scale(1.1)",
																		bg: "transparent",
																	}}
																	transition="all 0.2s"
																/>
															))}
															{currentRating > 0 && (
																<Text
																	fontSize={{ base: "xs", md: "sm" }}
																	color={textColor}
																	ml={2}
																>
																	({currentRating}/5)
																</Text>
															)}
														</HStack>
													</Box>
												);
											})()}

											<HStack
												justify="space-between"
												w="full"
												flexWrap={{ base: "wrap", md: "nowrap" }}
											>
												<VStack align="start" spacing={1}>
													<Badge
														colorScheme={"green"}
														variant="subtle"
														fontSize={{ base: "2xs", md: "xs" }}
													>
														{externalServices?.find(
															(service) =>
																service.id === recipe.externalServiceId,
														)?.serviceName || "不明なサービス"}
													</Badge>
												</VStack>

												<VStack align="end" spacing={1}>
													<Text
														fontSize={{ base: "2xs", md: "xs" }}
														color={textColor}
													>
														{recipe?.createdDate
															? new Date(recipe.createdDate).toLocaleDateString(
																	"ja-JP",
																	{
																		year: "numeric",
																		month: "2-digit",
																		day: "2-digit",
																	},
																)
															: "不明な日付"}
													</Text>
												</VStack>
											</HStack>
										</VStack>
									</CardBody>
								</MotionCard>
							))
						) : (
							<Box gridColumn="1 / -1" textAlign="center" py={16}>
								<VStack spacing={4}>
									<Image
										src="/bae-recipe/favicon.svg"
										alt="BAE Recipe Logo"
										boxSize={16}
										opacity={0.4}
									/>
									<Heading size="md" color={textColor}>
										{recipeQueryParam.keyword
											? `「${recipeQueryParam.keyword}」に一致するレシピが見つかりません`
											: "まだレシピがありません"}
									</Heading>
									<Text color={textColor}>
										{recipeQueryParam.keyword
											? "別のキーワードで検索してみてください"
											: "YouTube ShortsのURLを入力してAIでレシピを生成しましょう！"}
									</Text>
								</VStack>
							</Box>
						)}
					</SimpleGrid>{" "}
					{/* Pagination */}
					{recipes && recipes.pages > 1 && (
						<MotionBox
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							mt={12}
						>
							<Flex justify="center" direction="column" align="center" gap={4}>
								<HStack
									spacing={{ base: 1, md: 2 }}
									flexWrap="wrap"
									justify="center"
								>
									{/* Previous Page Button */}
									<IconButton
										aria-label="前のページ"
										icon={<Icon as={FaChevronLeft} />}
										isDisabled={recipeQueryParam.page === 1}
										onClick={() => handlePageChange(recipeQueryParam.page - 1)}
										variant="outline"
										colorScheme="orange"
										size={{ base: "sm", md: "md" }}
									/>

									{/* Page Numbers */}
									{Array.from(
										{ length: Math.min(5, recipes.pages) },
										(_, i) => {
											const startPage = Math.max(1, recipeQueryParam.page - 2);
											const pageNum = startPage + i;
											if (pageNum > recipes.pages) return null;

											return (
												<Button
													key={pageNum}
													onClick={() => handlePageChange(pageNum)}
													variant={
														pageNum === recipeQueryParam.page
															? "solid"
															: "outline"
													}
													colorScheme="orange"
													size={{ base: "sm", md: "md" }}
													minW={{ base: "32px", md: "40px" }}
													fontSize={{ base: "sm", md: "md" }}
												>
													{pageNum}
												</Button>
											);
										},
									)}

									{/* Next Page Button */}
									<IconButton
										aria-label="次のページ"
										icon={<Icon as={FaChevronRight} />}
										isDisabled={recipeQueryParam.page === recipes.pages}
										onClick={() => handlePageChange(recipeQueryParam.page + 1)}
										variant="outline"
										colorScheme="orange"
										size={{ base: "sm", md: "md" }}
									/>
								</HStack>
								{/* Page Info */}
								<Text
									textAlign="center"
									fontSize={{ base: "xs", md: "sm" }}
									color={textColor}
								>
									ページ {recipeQueryParam.page} / {recipes.pages}
									（全 {recipes.total} 件）
								</Text>{" "}
							</Flex>
						</MotionBox>
					)}
				</MotionBox>
			</Container>
		</Box>
	);
}
