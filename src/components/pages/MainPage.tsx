import {
	Badge,
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
	Input,
	InputGroup,
	InputRightElement,
	SimpleGrid,
	Tag,
	TagLabel,
	Text,
	VStack,
	Wrap,
	WrapItem,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	FaBookmark,
	FaChevronLeft,
	FaChevronRight,
	FaCookieBite,
	FaSearch,
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
	recipeUrlAtom,
} from "@/lib/atom/RecipeAtom";
import { updateUserRecipeAtom } from "@/lib/atom/UserAtom";
import { type UserRecipe, getUserRecipes } from "@/lib/domain/UserQuery";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";
import { useAtom, useSetAtom } from "jotai";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function MainPage() {
	const navigate = useNavigate();
	const [urlInput, setUrlInput] = useAtom(recipeUrlAtom);
	const [recipeQueryParam, setRecipeQueryParam] = useAtom(recipeQueryParamAtom);

	const toast = useToast();

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

		// AI解析ページに遷移
		const encodedUrl = encodeURIComponent(urlInput);
		navigate(`/home/ai-gen?url=${encodedUrl}`);
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

	useEffect(() => {
		fetchData();
	}, [recipes]);

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
							<HStack>
								<Icon as={FaVideo} boxSize={6} color="purple.500" />
								<Heading
									size="md"
									color={useColorModeValue("gray.800", "white")}
								>
									動画レシピをAIで解析
								</Heading>
								<Icon as={HiSparkles} boxSize={5} color="pink.500" />
							</HStack>

							<Text color={textColor} textAlign="center">
								YouTube
								Shortsの動画URLを入力すると、AIが自動でレシピを抽出・整理します
							</Text>

							<HStack w="full" spacing={4}>
								<InputGroup flex={1}>
									{" "}
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
								</InputGroup>{" "}
								<Button
									size="lg"
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
								{recipeQueryParam.keyword && (
									<Text as="span" color="orange.500" fontWeight="medium" ml={2}>
										「{recipeQueryParam.keyword}」で検索中
									</Text>
								)}
							</Text>
						</VStack>
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
									</Box>
									<CardBody p={6}>
										<VStack align="start" spacing={4}>
											<VStack align="start" spacing={2} w="full">
												<Heading size="md" noOfLines={2} lineHeight={1.3}>
													{recipe.recipeName}
												</Heading>

												{/* Genre Badge */}
												{recipe.genrue && (
													<Badge
														colorScheme="purple"
														variant="subtle"
														fontSize="xs"
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
																size="sm"
																colorScheme="orange"
																variant="subtle"
																rounded="full"
															>
																<TagLabel>{tag.trim()}</TagLabel>
															</Tag>
														</WrapItem>
													))}
												</Wrap>
											)}

											<HStack justify="space-between" w="full">
												<VStack align="start" spacing={1}>
													<Badge
														colorScheme={"green"}
														variant="subtle"
														fontSize="xs"
													>
														{externalServices?.find(
															(service) =>
																service.id === recipe.externalServiceId,
														)?.serviceName || "不明なサービス"}
													</Badge>
												</VStack>

												<VStack align="end" spacing={1}>
													<Text fontSize="xs" color={textColor}>
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
									<Icon as={FaCookieBite} boxSize={16} color="gray.300" />
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
					</SimpleGrid>

					{/* Pagination */}
					{recipes && recipes.pages > 1 && (
						<MotionBox
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							mt={12}
						>
							<Flex justify="center" align="center">
								<HStack spacing={2}>
									{/* Previous Page Button */}
									<IconButton
										aria-label="前のページ"
										icon={<Icon as={FaChevronLeft} />}
										isDisabled={recipeQueryParam.page === 1}
										onClick={() => handlePageChange(recipeQueryParam.page - 1)}
										variant="outline"
										colorScheme="orange"
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
													size="sm"
													minW="40px"
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
									/>
								</HStack>
							</Flex>

							{/* Page Info */}
							<Text textAlign="center" fontSize="sm" color={textColor} mt={4}>
								ページ {recipeQueryParam.page} / {recipes.pages}
								（全 {recipes.total} 件）
							</Text>
						</MotionBox>
					)}
				</MotionBox>
			</Container>
		</Box>
	);
}
