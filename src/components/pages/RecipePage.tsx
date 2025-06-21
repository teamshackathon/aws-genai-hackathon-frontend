import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	Container,
	Grid,
	GridItem,
	HStack,
	Heading,
	Icon,
	IconButton,
	Skeleton,
	SkeletonText,
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
import { useBreakpointValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
	FaArrowLeft,
	FaBookmark,
	FaClipboardList,
	FaClock,
	FaEdit,
	FaPlay,
	FaSave,
	FaShareAlt,
	FaStar,
	FaStickyNote,
	FaTag,
	FaTimes,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router";

import YouTubeThumbnail from "@/components/atoms/YouTubeThumbnail";
import Header from "@/components/organisms/Header";
import IngredientsCard from "@/components/organisms/IngredientsCard";
import ProcessCard from "@/components/organisms/ProcessCard";
import {
	currentRecipeAtom,
	externalServiceAtomLoadable,
	getIngridientsAtom,
	getProcessesAtom,
	getRecipeByIdAtom,
	ingredientsAtom,
	processesAtom,
	recipeStatusAtomLoadable,
} from "@/lib/atom/RecipeAtom";
import { postShoppingAtom } from "@/lib/atom/ShoppingAtom";
import { updateUserRecipeAtom } from "@/lib/atom/UserAtom";
import { getCookHistory } from "@/lib/domain/CookQuery";
import type { CookHistory } from "@/lib/domain/CookQuery";
import type { ExternalService, RecipeStatus } from "@/lib/domain/RecipeQuery";
import { type UserRecipe, getUserRecipe } from "@/lib/domain/UserQuery";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function RecipePage() {
	const { recipeId } = useParams<{ recipeId: string }>();
	const navigate = useNavigate();
	const toast = useToast();
	const [userRecipe, setUserRecipe] = useState<UserRecipe | null | undefined>(
		undefined,
	);
	const isMobile = useBreakpointValue({ base: true, md: false });
	const [isCreatingShoppingList, setIsCreatingShoppingList] = useState(false);
	const [cookHistory, setCookHistory] = useState<CookHistory[]>([]);
	const [isEditingNote, setIsEditingNote] = useState(false);
	const [noteValue, setNoteValue] = useState("");
	const [isSavingNote, setIsSavingNote] = useState(false);
	const [, getIngredients] = useAtom(getIngridientsAtom);
	const [, getProcesses] = useAtom(getProcessesAtom);
	const [, getCurrentRecipe] = useAtom(getRecipeByIdAtom);
	const ingredients = useAtomValue(ingredientsAtom);
	const processes = useAtomValue(processesAtom);
	const currentRecipe = useAtomValue(currentRecipeAtom);
	const postShopping = useSetAtom(postShoppingAtom);
	const updateUserRecipe = useSetAtom(updateUserRecipeAtom);

	// Color values
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, orange.900, pink.900, purple.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const headingColor = useColorModeValue("gray.800", "white"); // External services and statuses
	const externalServices = useLoadableAtom(externalServiceAtomLoadable);
	const recipeStatuses = useLoadableAtom(recipeStatusAtomLoadable);

	// Get external service name
	const getExternalServiceName = (serviceId: number): string => {
		if (externalServices) {
			const service = externalServices.find(
				(s: ExternalService) => s.id === serviceId,
			);
			return service?.serviceName || "不明なサービス";
		}
		return "読み込み中...";
	};

	// Get recipe status
	const getRecipeStatus = (statusId: number): string => {
		if (recipeStatuses) {
			const status = recipeStatuses.find(
				(s: RecipeStatus) => s.id === statusId,
			);
			return status?.status || "不明";
		}
		return "読み込み中...";
	};

	const fetchData = async (recipeId: number) => {
		const userRecipeData = await getUserRecipe(recipeId);
		if (!userRecipeData) {
			// ユーザーのレシピが存在しない場合はnullを設定
			setUserRecipe(null);
		}
		setUserRecipe(userRecipeData);
		// メモの初期値を設定
		setNoteValue(userRecipeData?.note || "");

		// クック履歴を取得
		const history = await getCookHistory(recipeId);
		setCookHistory(history);
	};

	// メモ編集開始
	const handleStartEditNote = () => {
		setNoteValue(userRecipe?.note || "");
		setIsEditingNote(true);
	};

	// メモ編集キャンセル
	const handleCancelEditNote = () => {
		setNoteValue(userRecipe?.note || "");
		setIsEditingNote(false);
	};

	// メモ保存
	const handleSaveNote = async () => {
		if (!currentRecipe) return;

		setIsSavingNote(true);
		try {
			await updateUserRecipe(currentRecipe.id, {
				note: noteValue || undefined,
			});

			// ローカルのuserRecipeを更新
			setUserRecipe((prev) =>
				prev ? { ...prev, note: noteValue || null } : null,
			);

			toast({
				title: "メモを保存しました",
				status: "success",
				duration: 2000,
				isClosable: true,
			});

			setIsEditingNote(false);
		} catch (error) {
			toast({
				title: "メモの保存に失敗しました",
				description: "もう一度お試しください",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsSavingNote(false);
		}
	};
	// Load recipe data on mount
	useEffect(() => {
		if (recipeId) {
			getCurrentRecipe(Number(recipeId));
			getIngredients(Number(recipeId));
			getProcesses(Number(recipeId));
			fetchData(Number(recipeId));
		}
	}, [recipeId, getCurrentRecipe, getIngredients, getProcesses]);

	const toggleBookmark = (recipeId: number, isFavorite: boolean) => {
		updateUserRecipe(recipeId, {
			is_favorite: !isFavorite,
		});
		// ローカルのuserRecipeを更新
		setUserRecipe((prev) =>
			prev ? { ...prev, isFavorite: !isFavorite } : null,
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
		setUserRecipe((prev) => (prev ? { ...prev, rating: newRating } : null));
		toast({
			title: "評価を更新しました",
			description: `${newRating}つ星の評価をつけました`,
			status: "success",
			duration: 2000,
			isClosable: true,
		});
	};

	// ★新しい関数: 買い物リスト作成ボタンのハンドラ
	const handleCreateShoppingList = async () => {
		if (!recipeId || !currentRecipe) {
			toast({
				title: "エラー",
				description: "レシピ情報が不足しています。",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setIsCreatingShoppingList(true); // ローディング開始

		try {
			const data = await postShopping(Number(recipeId));
			toast({
				title: "買い物リストを作成しました",
				description: "買い物リストページへ移動します。",
				status: "success",
				duration: 2000,
				isClosable: true,
			});
			navigate(`/home/shopping_list/${data.id}`); // 新しい買い物リストページへ遷移
		} catch (error: any) {
			// エラーの型を any にする
			toast({
				title: "買い物リストの作成に失敗しました",
				description: error.message || "予期せぬエラーが発生しました。",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsCreatingShoppingList(false); // ローディング終了
		}
	};

	// Loading state
	if (currentRecipe === undefined) {
		// データがロード中の場合
		return (
			<Box minH="100vh" bgGradient={bgGradient}>
				<Header />
				<Container maxW="6xl" py={8}>
					<VStack spacing={8}>
						<Skeleton height="40px" width="80%" />
						<Skeleton height="300px" width="100%" />
						<Grid
							templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
							gap={8}
							w="full"
						>
							<SkeletonText noOfLines={10} spacing="4" skeletonHeight="20px" />
							<SkeletonText noOfLines={10} spacing="4" skeletonHeight="20px" />
						</Grid>
					</VStack>
				</Container>
			</Box>
		);
	}

	// Error state
	if (currentRecipe === null || userRecipe === null) {
		return (
			<Box minH="100vh" bgGradient={bgGradient}>
				<Header />
				<Container maxW="6xl" py={8}>
					<VStack spacing={8}>
						<Heading>レシピが見つかりませんでした</Heading>
						<Button onClick={() => navigate("/home")}>ホームに戻る</Button>
					</VStack>
				</Container>
			</Box>
		);
	}

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			<Header />
			<Container maxW="6xl" py={8}>
				{/* Back button */}
				<MotionButton
					leftIcon={<Icon as={FaArrowLeft} />}
					variant="ghost"
					onClick={() => navigate("/home")}
					mb={6}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
				>
					レシピ一覧に戻る
				</MotionButton>

				{/* Recipe header */}
				<MotionCard
					bg={cardBg}
					shadow="xl"
					rounded="2xl"
					border="1px"
					borderColor={borderColor}
					mb={8}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<CardBody p={8}>
						<Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={8}>
							<GridItem>
								<VStack align="start" spacing={6}>
									{/* Recipe title and metadata */}
									<VStack align="start" spacing={4} w="full">
										<Heading
											as="h1"
											size="2xl"
											color={headingColor}
											lineHeight={1.2}
										>
											{currentRecipe.recipeName}
										</Heading>

										{/* Genre Badge */}
										{currentRecipe.genrue && (
											<Badge
												colorScheme="purple"
												variant="subtle"
												fontSize="md"
												px={3}
												py={1}
												rounded="md"
											>
												{currentRecipe.genrue}
											</Badge>
										)}

										{/* Keywords Tags */}
										{currentRecipe.keyword && (
											<Box w="full">
												<Text
													fontSize="sm"
													color={textColor}
													mb={2}
													fontWeight="medium"
												>
													キーワード:
												</Text>
												<Wrap spacing={2}>
													{currentRecipe.keyword
														.split(",")
														.map((tag, tagIndex) => (
															<WrapItem key={tagIndex}>
																<Tag
																	size="md"
																	colorScheme="orange"
																	variant="subtle"
																	rounded="full"
																>
																	<TagLabel>{tag.trim()}</TagLabel>
																</Tag>
															</WrapItem>
														))}
												</Wrap>{" "}
											</Box>
										)}

										{/* Rating Component */}
										{userRecipe?.rating && (
											<Box w="full">
												<Text
													fontSize="sm"
													color={textColor}
													mb={2}
													fontWeight="medium"
												>
													評価:
												</Text>
												<HStack spacing={2}>
													{[1, 2, 3, 4, 5].map((star) => (
														<IconButton
															key={star}
															aria-label={`${star}つ星の評価をつける`}
															icon={
																<Icon
																	as={FaStar}
																	color={
																		userRecipe?.rating &&
																		star <= userRecipe?.rating
																			? "yellow.400"
																			: "gray.300"
																	}
																/>
															}
															size="md"
															variant="ghost"
															onClick={() => {
																updateRating(currentRecipe.id, star);
															}}
															_hover={{
																transform: "scale(1.1)",
																bg: "transparent",
															}}
															transition="all 0.2s"
														/>
													))}
													{userRecipe?.rating > 0 && (
														<Text
															fontSize="md"
															color={textColor}
															ml={2}
															fontWeight="medium"
														>
															({userRecipe?.rating}/5)
														</Text>
													)}
												</HStack>
											</Box>
										)}

										<HStack spacing={4} flexWrap="wrap">
											<Badge
												colorScheme="orange"
												fontSize="sm"
												px={3}
												py={1}
												rounded="full"
											>
												<HStack spacing={1}>
													<Icon as={FaTag} boxSize={3} />
													<Text>
														{getExternalServiceName(
															currentRecipe.externalServiceId,
														)}
													</Text>
												</HStack>
											</Badge>

											<Badge
												colorScheme="blue"
												fontSize="sm"
												px={3}
												py={1}
												rounded="full"
											>
												{getRecipeStatus(currentRecipe.status_id)}
											</Badge>
										</HStack>
										<HStack spacing={2} color={textColor} fontSize="sm">
											<Icon as={FaClock} />
											<Text>
												作成日: {currentRecipe.createdDate.toLocaleDateString()}
											</Text>
											<Text>•</Text>
											<Text>
												更新日: {currentRecipe.updatedDate.toLocaleDateString()}
											</Text>
											<Text>•</Text>
											<Text>調理回数: {cookHistory.length}回</Text>
										</HStack>
									</VStack>

									{/* Action buttons */}
									<HStack spacing={4} w="full" flexWrap="wrap">
										<MotionButton
											leftIcon={
												<Icon
													as={FaBookmark}
													color={
														userRecipe?.isFavorite ? "orange.400" : "gray.400"
													}
												/>
											}
											variant={userRecipe?.isFavorite ? "solid" : "outline"}
											colorScheme="orange"
											onClick={() =>
												toggleBookmark(
													currentRecipe.id,
													userRecipe?.isFavorite || false,
												)
											}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											{userRecipe?.isFavorite
												? "ブックマーク済み"
												: "ブックマーク"}
										</MotionButton>
										{/* ★「買い物リストを作成」ボタンを追加 */}
										<MotionButton
											leftIcon={<Icon as={FaClipboardList} />}
											variant="solid" // solid スタイルを使用
											colorScheme="teal" // teal スタイルを使用
											onClick={handleCreateShoppingList}
											isLoading={isCreatingShoppingList} // ローディング状態を反映
											loadingText="作成中"
											spinnerPlacement="start"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											買い物リストを作成
										</MotionButton>{" "}
										{/* ★「料理開始」ボタンを追加 */}
										{processes.length > 0 && (
											<MotionButton
												leftIcon={<Icon as={FaPlay} />}
												variant="solid"
												colorScheme="purple"
												onClick={() =>
													navigate(`/home/recipe/${recipeId}/cook`)
												}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												料理開始
											</MotionButton>
										)}
										{/* ★「レシピ共有」ボタンを追加 */}
										<MotionButton
											leftIcon={<Icon as={FaShareAlt} />}
											variant="outline"
											colorScheme="blue"
											onClick={() => {
												// レシピテキストを生成
												const recipeText = [
													`【${currentRecipe.recipeName}】`,
													"",
													"■ 材料",
													...ingredients.map(
														(ing) => `・${ing.ingredient} ${ing.amount || ""}`,
													),
													"",
													"■ 手順",
													...processes
														.sort((a, b) => a.processNumber - b.processNumber)
														.map((proc, idx) => `${idx + 1}. ${proc.process}`),
												].join("\n");
												// クリップボードにコピー
												navigator.clipboard
													.writeText(recipeText)
													.then(() => {
														toast({
															title: "レシピをコピーしました",
															description:
																"テキストデータがクリップボードに保存されました。",
															status: "success",
															duration: 2000,
															isClosable: true,
														});
													})
													.catch(() => {
														toast({
															title: "コピーに失敗しました",
															description:
																"クリップボードへのコピーに失敗しました。",
															status: "error",
															duration: 2000,
															isClosable: true,
														});
													});
											}}
										>
											{!isMobile && "レシピをテキストでコピー"}
										</MotionButton>
									</HStack>
								</VStack>
							</GridItem>

							{/* Recipe image placeholder */}
							<GridItem>
								<Box
									rounded="xl"
									h="300px"
									overflow="hidden"
									shadow="lg"
									border="1px"
									borderColor={borderColor}
								>
									<YouTubeThumbnail
										url={currentRecipe.url}
										alt={currentRecipe.recipeName}
										height="300px"
										width="full"
										objectFit="cover"
										onClick={() => {
											if (currentRecipe.url) {
												window.open(
													currentRecipe.url,
													"_blank",
													"noopener,noreferrer",
												);
											}
										}}
									/>
								</Box>
							</GridItem>
						</Grid>
					</CardBody>
				</MotionCard>

				{/* Main content */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
					{/* Ingredients */}
					<IngredientsCard
						ingredients={ingredients}
						recipeId={Number(recipeId)}
						isLoading={!currentRecipe}
						editable={true}
					/>{" "}
					{/* Cooking process */}
					<ProcessCard
						processes={processes}
						recipeId={Number(recipeId)}
						isLoading={!currentRecipe}
						editable={true}
					/>
				</Grid>

				{/* Additional info */}
				<MotionCard
					bg={cardBg}
					shadow="xl"
					rounded="2xl"
					border="1px"
					borderColor={borderColor}
					mt={8}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					<CardBody p={8}>
						<VStack spacing={6} align="stretch">
							<Heading size="lg" color={headingColor}>
								レシピについて
							</Heading>

							<Grid
								templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
								gap={6}
							>
								<VStack align="start" spacing={3}>
									<Text fontWeight="semibold" color={headingColor}>
										AI解析情報
									</Text>
									<Text color={textColor} fontSize="sm">
										このレシピはAIによって動画から自動抽出されました
									</Text>
								</VStack>

								{/* メモ機能 */}
								<VStack align="start" spacing={3}>
									<HStack justify="space-between" w="full">
										<HStack spacing={2}>
											<Icon as={FaStickyNote} color="orange.500" />
											<Text fontWeight="semibold" color={headingColor}>
												メモ
											</Text>
										</HStack>
										{!isEditingNote && (
											<IconButton
												aria-label="メモを編集"
												icon={<FaEdit />}
												size="sm"
												variant="ghost"
												colorScheme="orange"
												onClick={handleStartEditNote}
											/>
										)}
									</HStack>

									{isEditingNote ? (
										<VStack spacing={3} w="full">
											<Textarea
												value={noteValue}
												onChange={(e) => setNoteValue(e.target.value)}
												placeholder="レシピについてのメモを書いてください..."
												size="sm"
												minH="100px"
												resize="vertical"
												bg={useColorModeValue("white", "gray.700")}
											/>
											<HStack spacing={2} w="full">
												<Button
													size="sm"
													colorScheme="orange"
													onClick={handleSaveNote}
													isLoading={isSavingNote}
													loadingText="保存中"
													leftIcon={<FaSave />}
													flex={1}
												>
													保存
												</Button>
												<Button
													size="sm"
													variant="ghost"
													onClick={handleCancelEditNote}
													leftIcon={<FaTimes />}
													flex={1}
												>
													キャンセル
												</Button>
											</HStack>
										</VStack>
									) : (
										<Box
											w="full"
											minH="60px"
											p={3}
											bg={useColorModeValue("gray.50", "gray.700")}
											rounded="md"
											border="1px"
											borderColor={borderColor}
										>
											{(() => {
												const currentNote = userRecipe?.note;

												return currentNote ? (
													<Text
														color={textColor}
														fontSize="sm"
														whiteSpace="pre-wrap"
														lineHeight={1.5}
													>
														{currentNote}
													</Text>
												) : (
													<Text
														color={useColorModeValue("gray.400", "gray.500")}
														fontSize="sm"
														fontStyle="italic"
													>
														メモを追加するには編集ボタンをクリックしてください
													</Text>
												);
											})()}
										</Box>
									)}
								</VStack>
							</Grid>
						</VStack>
					</CardBody>{" "}
				</MotionCard>
			</Container>
		</Box>
	);
}
