import {
	// Badge,
	Box,
	Button,
	Card,
	CardBody,
	Container,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Image,
	Input,
	InputGroup,
	InputRightElement,
	SimpleGrid,
	Spinner,
	Text,
	VStack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	FaBookmark,
	FaClock,
	FaCookieBite,
	// FaHeart,
	FaSearch,
	FaVideo,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router";

import AIProcessChat from "@/components/organisms/AIProcessChat";
import Header from "@/components/organisms/Header";
import { recipeListAtomLoadable, recipeUrlAtom } from "@/lib/atom/RecipeAtom";
import { sessionAtomLoadable } from "@/lib/atom/SessionAtom";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";
import { useAtom } from "jotai";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// モックデータ - 実際のデータはAPIから取得

// 難易度に応じた色
// const getDifficultyColor = (difficulty: string) => {
// 	switch (difficulty) {
// 		case "簡単":
// 			return "green";
// 		case "普通":
// 			return "blue";
// 		case "やや難しい":
// 			return "orange";
// 		case "難しい":
// 			return "red";
// 		default:
// 			return "gray";
// 	}
// };

export default function MainPage() {
	const navigate = useNavigate();
	const [urlInput, setUrlInput] = useAtom(recipeUrlAtom);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [bookmarkedRecipes, setBookmarkedRecipes] = useState(new Set());

	const toast = useToast();

	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, orange.900, pink.900, purple.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	const session = useLoadableAtom(sessionAtomLoadable);
	const recipes = useLoadableAtom(recipeListAtomLoadable);

	const handleUrlSubmit = async () => {
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
		// チャットを開く
		setIsChatOpen(true);
		setIsProcessing(true);
	};

	const toggleBookmark = (recipeId: number) => {
		setBookmarkedRecipes((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(recipeId)) {
				newSet.delete(recipeId);
				toast({
					title: "ブックマークを解除しました",
					status: "info",
					duration: 2000,
					isClosable: true,
				});
			} else {
				newSet.add(recipeId);
				toast({
					title: "ブックマークに追加しました",
					status: "success",
					duration: 2000,
					isClosable: true,
				});
			}
			return newSet;
		});
	};

	useEffect(() => {
		if (session) {
			setIsChatOpen(true);
			setIsProcessing(true);
		}
	}, [session]);

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
							<Icon as={FaCookieBite} boxSize={8} color="orange.500" />
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
							<HStack spacing={2}>
								{" "}
								{/* spacing追加 */}
								<Icon as={FaVideo} boxSize={6} color="purple.500" />
								<Heading
									size="md"
									color={useColorModeValue("gray.800", "white")}
									lineHeight="1.4" // 少し行間をゆったり
								>
									動画レシピをAIで解析
								</Heading>
								<Icon as={HiSparkles} boxSize={5} color="pink.500" />
							</HStack>

							<Text
								color={textColor}
								textAlign="center"
								fontSize="md" // 明示的に中サイズ指定
								lineHeight="1.8" // 行間広げて見やすく
								px={4} // スマホ対策で左右に余白
							>
								YouTube や TikTok の動画URLを入力すると、
								<br />
								AIが自動でレシピを抽出・整理します
							</Text>

							<HStack w="full" spacing={4}>
								<InputGroup flex={1}>
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
										isDisabled={isProcessing}
									/>
									<InputRightElement height="100%">
										<Icon as={FaSearch} color="gray.400" />
									</InputRightElement>
								</InputGroup>

								<Button
									size="lg"
									bgGradient="linear(to-r, orange.400, pink.400)"
									color="white"
									_hover={{
										bgGradient: "linear(to-r, orange.500, pink.500)",
										transform: "translateY(-2px)",
										shadow: "lg",
									}}
									leftIcon={
										isProcessing ? (
											<Spinner size="sm" />
										) : (
											<Icon as={HiSparkles} />
										)
									}
									onClick={handleUrlSubmit}
									isLoading={isProcessing}
									loadingText="解析中..."
									transition="all 0.3s"
									px={8}
								>
									AI解析開始
								</Button>
							</HStack>
						</VStack>
					</Box>
				</MotionBox>

				{/* レシピ一覧セクション */}
				<MotionBox
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Flex justify="space-between" align="center" mb={8}>
						<VStack align="start" spacing={2}>
							<Heading size="lg" color={useColorModeValue("gray.800", "white")}>
								あなたのレシピ
							</Heading>
							<Text color={textColor}>
								{recipes?.total}個のレシピが保存されています
							</Text>
						</VStack>
					</Flex>

					<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
						{recipes?.items.map((recipe, index) => (
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
									<Image
										// src={recipe.thumbnail}
										alt={recipe.recipeName}
										h="200px"
										w="full"
										objectFit="cover"
									/>
									<IconButton
										aria-label="ブックマーク"
										icon={
											<Icon
												as={FaBookmark}
												color={
													bookmarkedRecipes.has(recipe.id)
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
											toggleBookmark(recipe.id);
										}}
									/>
								</Box>

								<CardBody p={6}>
									<VStack align="start" spacing={4}>
										<VStack align="start" spacing={2} w="full">
											<Heading size="md" noOfLines={2} lineHeight={1.3}>
												{recipe.recipeName}
											</Heading>

											{/* <HStack spacing={2} flexWrap="wrap">
												{recipe.tags.slice(0, 2).map((tag) => (
													<Badge
														key={tag}
														colorScheme="orange"
														variant="subtle"
														fontSize="xs"
													>
														{tag}
													</Badge>
												))}
											</HStack> */}
										</VStack>

										<HStack justify="space-between" w="full">
											<VStack align="start" spacing={1}>
												<HStack spacing={1}>
													<Icon as={FaClock} boxSize={3} color="gray.500" />
													{/* <Text fontSize="sm" color={textColor}>
														{recipe.cookingTime}
													</Text> */}
												</HStack>
												{/* <Badge
													colorScheme={getDifficultyColor(recipe.difficulty)}
													variant="subtle"
													fontSize="xs"
												>
													{recipe.difficulty}
												</Badge> */}
											</VStack>

											<VStack align="end" spacing={1}>
												{/* <HStack spacing={1}>
													<Icon as={FaHeart} boxSize={3} color="red.400" />
													<Text fontSize="sm" color={textColor}>
														{recipe.likes}
													</Text>
												</HStack> */}
												{/* <Text fontSize="xs" color={textColor}>
													{recipe?.createdDate}
												</Text> */}
											</VStack>
										</HStack>
									</VStack>
								</CardBody>
							</MotionCard>
						))}
					</SimpleGrid>
				</MotionBox>
			</Container>

			{/* AI処理チャット */}
			<AIProcessChat
				isOpen={isChatOpen}
				isProcessing={isProcessing}
				onClose={() => setIsChatOpen(false)}
			/>
		</Box>
	);
}
