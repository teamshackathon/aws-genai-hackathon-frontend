import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Container,
	Flex,
	Grid,
	GridItem,
	HStack,
	Heading,
	Icon,
	List,
	ListItem,
	Skeleton,
	SkeletonText,
	Text,
	VStack,
	useColorModeValue,
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
	FaCookieBite,
	FaExternalLinkAlt,
	FaShoppingCart,
	FaTag,
	FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router";

import Header from "@/components/organisms/Header";
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
import { postShoppingListAtom } from "@/lib/atom/ShoppingAtom";
import type { ExternalService, RecipeStatus } from "@/lib/domain/RecipeQuery";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function RecipePage() {
	const { recipeId } = useParams<{ recipeId: string }>();
	const navigate = useNavigate();
	const toast = useToast();

	const [isBookmarked, setIsBookmarked] = useState(false);
	const [isCreatingShoppingList, setIsCreatingShoppingList] = useState(false);
	const [, getIngredients] = useAtom(getIngridientsAtom);
	const [, getProcesses] = useAtom(getProcessesAtom);
	const [, getCurrentRecipe] = useAtom(getRecipeByIdAtom);
	const ingredients = useAtomValue(ingredientsAtom);
	const processes = useAtomValue(processesAtom);
	const currentRecipe = useAtomValue(currentRecipeAtom);
	const postShoppingList = useSetAtom(postShoppingListAtom);

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
	// Load recipe data on mount
	useEffect(() => {
		if (recipeId) {
			getCurrentRecipe(Number(recipeId));
			getIngredients(Number(recipeId));
			getProcesses(Number(recipeId));
		}
	}, [recipeId, getCurrentRecipe, getIngredients, getProcesses]);

	const handleBookmark = () => {
		setIsBookmarked(!isBookmarked);
		toast({
			title: isBookmarked
				? "ブックマークを解除しました"
				: "ブックマークに追加しました",
			status: isBookmarked ? "info" : "success",
			duration: 2000,
			isClosable: true,
		});
	};

	const handleOpenOriginal = () => {
		if (currentRecipe?.url) {
			window.open(currentRecipe.url, "_blank");
		}
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
			const data = await postShoppingList(Number(recipeId));
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
									<HStack spacing={4} w="full">
										<MotionButton
											leftIcon={
												<Icon
													as={FaBookmark}
													color={isBookmarked ? "orange.400" : "gray.400"}
												/>
											}
											variant={isBookmarked ? "solid" : "outline"}
											colorScheme="orange"
											onClick={handleBookmark}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											{isBookmarked ? "ブックマーク済み" : "ブックマーク"}
										</MotionButton>

										{currentRecipe.url && (
											<MotionButton
												leftIcon={<Icon as={FaExternalLinkAlt} />}
												variant="outline"
												colorScheme="purple"
												onClick={handleOpenOriginal}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												元動画を見る
											</MotionButton>
										)}
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
									</HStack>
								</VStack>
							</GridItem>

							{/* Recipe image placeholder */}
							<GridItem>
								<Box
									bg={useColorModeValue("gray.100", "gray.700")}
									rounded="xl"
									h="300px"
									display="flex"
									alignItems="center"
									justifyContent="center"
									position="relative"
									overflow="hidden"
								>
									<VStack spacing={3}>
										<Icon as={FaCookieBite} boxSize={12} color={textColor} />
										<Text color={textColor} fontWeight="semibold">
											レシピ画像
										</Text>
									</VStack>
								</Box>
							</GridItem>
						</Grid>
					</CardBody>
				</MotionCard>

				{/* Main content */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
					{/* Ingredients */}
					<MotionCard
						bg={cardBg}
						shadow="xl"
						rounded="2xl"
						border="1px"
						borderColor={borderColor}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<CardHeader pb={4}>
							<HStack spacing={3}>
								<Icon as={FaShoppingCart} boxSize={6} color="green.500" />
								<Heading size="lg" color={headingColor}>
									材料
								</Heading>
								<Badge colorScheme="green" variant="subtle">
									{ingredients.length}品目
								</Badge>
							</HStack>
						</CardHeader>
						<CardBody pt={0}>
							{ingredients.length >= 0 ? (
								<List spacing={3}>
									{ingredients.map((ingredient, index) => (
										<ListItem
											key={ingredient.id}
											p={3}
											bg={useColorModeValue("gray.50", "gray.700")}
											rounded="lg"
											border="1px"
											borderColor={borderColor}
										>
											<Flex justify="space-between" align="center">
												<HStack spacing={3}>
													<Box
														w={6}
														h={6}
														bg="green.100"
														color="green.600"
														rounded="full"
														display="flex"
														alignItems="center"
														justifyContent="center"
														fontSize="xs"
														fontWeight="bold"
													>
														{index + 1}
													</Box>
													<Text fontWeight="semibold" color={headingColor}>
														{ingredient.ingredient}
													</Text>
												</HStack>
												<Text color={textColor} fontWeight="medium">
													{ingredient.amount}
												</Text>
											</Flex>
										</ListItem>
									))}
								</List>
							) : (
								<Text color={textColor} textAlign="center" py={8}>
									材料が読み込み中です...
								</Text>
							)}
						</CardBody>
					</MotionCard>

					{/* Cooking process */}
					<MotionCard
						bg={cardBg}
						shadow="xl"
						rounded="2xl"
						border="1px"
						borderColor={borderColor}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						<CardHeader pb={4}>
							<HStack spacing={3}>
								<Icon as={FaCookieBite} boxSize={6} color="purple.500" />
								<Heading size="lg" color={headingColor}>
									調理手順
								</Heading>
								<Badge colorScheme="purple" variant="subtle">
									{processes.length}ステップ
								</Badge>
							</HStack>
						</CardHeader>
						<CardBody pt={0}>
							{processes.length >= 0 ? (
								<List spacing={4}>
									{processes
										.sort((a, b) => a.processNumber - b.processNumber)
										.map((process) => (
											<ListItem
												key={process.id}
												p={4}
												bg={useColorModeValue("gray.50", "gray.700")}
												rounded="lg"
												border="1px"
												borderColor={borderColor}
												position="relative"
											>
												<Box
													position="absolute"
													top={4}
													left={4}
													w={8}
													h={8}
													bg="purple.100"
													color="purple.600"
													rounded="full"
													display="flex"
													alignItems="center"
													justifyContent="center"
													fontSize="sm"
													fontWeight="bold"
												>
													{process.processNumber}
												</Box>
												<Text
													pl={12}
													color={headingColor}
													lineHeight={1.6}
													whiteSpace="pre-wrap"
												>
													{process.process}
												</Text>
											</ListItem>
										))}
								</List>
							) : (
								<Text color={textColor} textAlign="center" py={8}>
									調理手順が読み込み中です...
								</Text>
							)}
						</CardBody>
					</MotionCard>
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
										元動画URL
									</Text>
									{currentRecipe.url ? (
										<Button
											as="a"
											href={currentRecipe.url}
											target="_blank"
											leftIcon={<Icon as={FaExternalLinkAlt} />}
											colorScheme="blue"
											variant="outline"
											size="sm"
											isTruncated
											maxW="full"
										>
											動画を見る
										</Button>
									) : (
										<Text color={textColor}>URLが設定されていません</Text>
									)}
								</VStack>

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
					</CardBody>
				</MotionCard>
			</Container>
		</Box>
	);
}
