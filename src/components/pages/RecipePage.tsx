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
	VStack,
	Wrap,
	WrapItem,
	useColorModeValue,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
	FaArrowLeft,
	FaBookmark,
	FaClipboardList,
	FaClock,
	FaPlay,
	FaStar,
	FaTag,
	FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router";

import YouTubeThumbnail from "@/components/atoms/YouTubeThumbnail";
import CookingModal from "@/components/organisms/CookingModal";
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
import type { ExternalService, RecipeStatus } from "@/lib/domain/RecipeQuery";
import { type UserRecipe, getUserRecipes } from "@/lib/domain/UserQuery";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function RecipePage() {
	const { recipeId } = useParams<{ recipeId: string }>();
	const navigate = useNavigate();
	const toast = useToast();
	const [userRecipe, setUserRecipe] = useState<UserRecipe[]>([]);
	const [isCreatingShoppingList, setIsCreatingShoppingList] = useState(false);
	const {
		isOpen: isCookingModalOpen,
		onOpen: onCookingModalOpen,
		onClose: onCookingModalClose,
	} = useDisclosure();
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

	const fetchData = async () => {
		if (currentRecipe) {
			const userRecipes = await getUserRecipes(String(currentRecipe.id));
			setUserRecipe(userRecipes);
		}
	};
	// Load recipe data on mount
	useEffect(() => {
		if (recipeId) {
			getCurrentRecipe(Number(recipeId));
			getIngredients(Number(recipeId));
			getProcesses(Number(recipeId));
			fetchData();
		}
	}, [recipeId, getCurrentRecipe, getIngredients, getProcesses]);

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
	if (!currentRecipe) {
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
	if (!currentRecipe) {
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
										{(() => {
											const currentUserRecipe = userRecipe.find(
												(ur) => ur.recipeId === currentRecipe.id,
											);
											const currentRating = currentUserRecipe?.rating || 0;

											return (
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
																			star <= currentRating
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
														{currentRating > 0 && (
															<Text
																fontSize="md"
																color={textColor}
																ml={2}
																fontWeight="medium"
															>
																({currentRating}/5)
															</Text>
														)}
													</HStack>
												</Box>
											);
										})()}

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

											<Badge
												colorScheme="purple"
												variant="outline"
												fontSize="sm"
												px={3}
												py={1}
												rounded="full"
											>
												<HStack spacing={1}>
													<Icon as={FaUser} boxSize={3} />
													<Text>BAE-RECIPE</Text>
												</HStack>
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
										</HStack>
									</VStack>

									{/* Action buttons */}
									<HStack spacing={4} w="full" flexWrap="wrap">
										<MotionButton
											leftIcon={
												<Icon
													as={FaBookmark}
													color={
														userRecipe.find(
															(ur) => ur.recipeId === currentRecipe.id,
														)?.isFavorite
															? "orange.400"
															: "gray.400"
													}
												/>
											}
											variant={
												userRecipe.find(
													(ur) => ur.recipeId === currentRecipe.id,
												)?.isFavorite
													? "solid"
													: "outline"
											}
											colorScheme="orange"
											onClick={() =>
												toggleBookmark(
													currentRecipe.id,
													userRecipe.find(
														(ur) => ur.recipeId === currentRecipe.id,
													)?.isFavorite || false,
												)
											}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											{userRecipe.find((ur) => ur.recipeId === currentRecipe.id)
												?.isFavorite
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
										</MotionButton>
										{/* ★「料理開始」ボタンを追加 */}
										{processes.length > 0 && (
											<MotionButton
												leftIcon={<Icon as={FaPlay} />}
												variant="solid"
												colorScheme="purple"
												onClick={onCookingModalOpen}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												料理開始
											</MotionButton>
										)}
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
							</Grid>
						</VStack>
					</CardBody>{" "}
				</MotionCard>
			</Container>
			{/* CookingModal */}{" "}
			<CookingModal
				isOpen={isCookingModalOpen}
				onClose={onCookingModalClose}
				processes={processes.map((process) => ({
					id: process.id,
					recipeId: process.recipeId,
					stepNumber: process.processNumber,
					instruction: process.process,
					estimatedTime: undefined, // processにestimatedTimeフィールドがない場合
					createdAt: process.createdDate,
					updatedAt: process.updatedDate,
				}))}
				recipeName={currentRecipe?.recipeName || "レシピ"}
			/>
		</Box>
	);
}
