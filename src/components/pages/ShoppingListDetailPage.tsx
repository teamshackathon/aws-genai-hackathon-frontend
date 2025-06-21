// src/pages/ShoppingListDetailPage.tsx
import {
	Box,
	Button,
	Card,
	Checkbox,
	Container,
	Divider,
	Flex,
	HStack,
	Heading,
	Icon,
	List,
	ListItem,
	Spinner,
	Text,
	VStack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
	FaArrowLeft,
	FaCalendarAlt,
	FaClipboardList,
	FaShareAlt, // 共有アイコン
	FaUtensils,
} from "react-icons/fa"; // 新しいアイコンをインポート
import { useNavigate, useParams } from "react-router";

import Header from "@/components/organisms/Header";
import { updatedShoppingItemAtom } from "@/lib/atom/ShoppingAtom";
import { type Recipe, getRecipeById } from "@/lib/domain/RecipeQuery";
import {
	type Shopping,
	type ShoppingItem,
	getShopping,
	getShoppingItems,
} from "@/lib/domain/ShoppingListQuery";
import { useSetAtom } from "jotai";

export default function ShoppingListDetailPage() {
	const { shoppingListId } = useParams<{ shoppingListId: string }>();
	const navigate = useNavigate();
	const toast = useToast();

	const [shoppingList, setShoppingList] = useState<Shopping | null>(null);
	const [shoppingListItems, setShoppingListItem] = useState<ShoppingItem[]>([]);

	const [recipe, setRecipe] = useState<Recipe | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const updateShippingListItem = useSetAtom(updatedShoppingItemAtom);

	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const headingColor = useColorModeValue("gray.800", "white");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	const fetchShoppingList = async () => {
		setIsLoading(true);
		if (!shoppingListId) {
			setError("買い物リストIDが指定されていません。");
			setIsLoading(false);
		} else {
			setError(null);
			const shoppingListData = await getShopping(Number(shoppingListId));
			if (shoppingListData) {
				setShoppingList(shoppingListData);
			} else {
				setError("買い物リストの取得に失敗しました。");
			}
			const shoppingListItemsData = await getShoppingItems(shoppingListId);
			if (shoppingListItems) {
				setShoppingListItem(shoppingListItemsData);
			} else {
				setError("買い物リストの取得に失敗しました。");
			}
			const recipeData = await getRecipeById(shoppingListData.recipeId);
			if (recipeData) {
				setRecipe(recipeData);
			} else {
				setError("関連レシピの取得に失敗しました。");
			}
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchShoppingList();
	}, []);

	// 材料のチェック状態を切り替えるハンドラ
	const handleItemCheck = async (itemId: number, currentIsChecked: boolean) => {
		if (!shoppingListId) return;

		// UIを先に更新して、ユーザー体験を向上させる（Optimistic Update）
		setShoppingListItem((prevItem) => {
			if (!prevItem) return [];
			return prevItem.map((item) =>
				item.id === itemId ? { ...item, isChecked: !currentIsChecked } : item,
			);
		});

		try {
			await updateShippingListItem(itemId.toString(), {
				is_checked: !currentIsChecked,
			});
			// 成功トーストは不要（UIが既に更新されているため）
		} catch (err: any) {
			// エラーが発生した場合、UIを元の状態に戻す（Rollback）
			setShoppingListItem((prevList) => {
				if (!prevList) return [];
				return prevList.map((item) =>
					item.id === itemId ? { ...item, isChecked: currentIsChecked } : item,
				);
			});
			toast({
				title: "更新に失敗しました",
				description: err.message || "チェック状態の更新に失敗しました。",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			console.error("Failed to update shopping list item:", err);
		}
	};

	// 共有機能のハンドラ
	const handleShare = async () => {
		if (!shoppingList) {
			toast({
				title: "エラー",
				description: "買い物リストが読み込まれていません。",
				status: "error",
				duration: 2000,
				isClosable: true,
			});
			return;
		}

		const shareTitle = shoppingList.listName;
		const shareText = `【${shareTitle}】\n\n${shoppingListItems.filter((item) => item.isChecked)}\n\n買い物リストはこちら: ${window.location.href}`;

		if (navigator.share) {
			try {
				await navigator.share({
					title: shareTitle,
					text: shareText,
					url: window.location.href,
				});
				toast({
					title: "買い物リストを共有しました",
					status: "success",
					duration: 2000,
					isClosable: true,
				});
			} catch (error) {
				console.error("Sharing failed:", error);
				toast({
					title: "共有に失敗しました",
					description:
						"お使いのブラウザでは共有機能が利用できないか、エラーが発生しました。",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} else {
			navigator.clipboard
				.writeText(shareText)
				.then(() => {
					toast({
						title: "買い物リストをクリップボードにコピーしました",
						description: "LINEなどに貼り付けてご利用ください。",
						status: "info",
						duration: 3000,
						isClosable: true,
					});
				})
				.catch((err) => {
					console.error("Could not copy text: ", err);
					toast({
						title: "コピーに失敗しました",
						status: "error",
						duration: 3000,
						isClosable: true,
					});
				});
		}
	};

	if (isLoading) {
		return (
			<Box
				minH="100vh"
				bgGradient="linear(to-br, orange.50, pink.50, purple.50)"
			>
				<Header />
				<Container maxW="4xl" py={8}>
					<VStack spacing={8} align="stretch">
						<Heading as="h1" size="xl" color={headingColor}>
							<Spinner size="md" mr={2} />
							リストを読み込み中...
						</Heading>
						<Card bg={cardBg} shadow="md" rounded="lg" p={5}>
							<Spinner size="lg" color="teal.500" />
							<Text ml={4} fontSize="lg" color={textColor}>
								詳細情報を読み込み中...
							</Text>
						</Card>
					</VStack>
				</Container>
			</Box>
		);
	}

	if (error) {
		return (
			<Box
				minH="100vh"
				bgGradient="linear(to-br, orange.50, pink.50, purple.50)"
			>
				<Header />
				<Container maxW="4xl" py={8}>
					<VStack spacing={8} align="stretch">
						<Heading as="h1" size="xl" color={headingColor}>
							買い物リスト
						</Heading>
						<Box textAlign="center" py={10}>
							<Text color="red.500" fontSize="lg" mb={4}>
								エラー: {error}
							</Text>
							<Text color={textColor}>
								買い物リストの取得中に問題が発生しました。
							</Text>
							<Button mt={4} onClick={() => navigate("/home/shopping_list")}>
								リスト一覧に戻る
							</Button>
						</Box>
					</VStack>
				</Container>
			</Box>
		);
	}

	if (!shoppingList) {
		// エラーでもローディングでもないがリストがない場合の考慮
		return (
			<Box
				minH="100vh"
				bgGradient="linear(to-br, orange.50, pink.50, purple.50)"
			>
				<Header />
				<Container maxW="4xl" py={8}>
					<VStack spacing={8} align="stretch">
						<Heading as="h1" size="xl" color={headingColor}>
							買い物リスト
						</Heading>
						<Box textAlign="center" py={10}>
							<Text fontSize="lg" color={textColor} mb={4}>
								指定された買い物リストは見つかりませんでした。
							</Text>
							<Button mt={4} onClick={() => navigate("/home/shopping_list")}>
								リスト一覧に戻る
							</Button>
						</Box>
					</VStack>
				</Container>
			</Box>
		);
	}

	return (
		<Box minH="100vh" bgGradient="linear(to-br, orange.50, pink.50, purple.50)">
			<Header />
			<Container maxW="4xl" py={8}>
				<VStack spacing={8} align="stretch">
					<HStack justifyContent="space-between" alignItems="center">
						<Button
							leftIcon={<Icon as={FaArrowLeft} />}
							variant="ghost"
							onClick={() => navigate("/home/shopping_list")}
						>
							買い物リスト一覧に戻る
						</Button>
						<Button
							leftIcon={<Icon as={FaShareAlt} />}
							colorScheme="teal"
							variant="outline"
							onClick={handleShare}
						>
							共有
						</Button>
					</HStack>

					<Card
						bg={cardBg}
						shadow="xl"
						rounded="2xl"
						border="1px"
						borderColor={borderColor}
						p={8}
					>
						<VStack align="start" spacing={4}>
							<HStack>
								<Icon as={FaClipboardList} color="teal.500" boxSize={6} />
								<Heading as="h1" size="xl" color={headingColor}>
									{shoppingList.listName}
								</Heading>
							</HStack>
							{recipe?.recipeName && (
								<HStack fontSize="md" color={textColor}>
									<Icon as={FaUtensils} />
									<Text>関連レシピ: {recipe?.recipeName}</Text>
								</HStack>
							)}
							<HStack fontSize="md" color={textColor}>
								<Icon as={FaCalendarAlt} />
								<Text>
									作成日:{" "}
									{new Date(shoppingList.createdAt).toLocaleDateString()}
								</Text>
							</HStack>
							<Divider my={4} />

							<Heading size="lg" color={headingColor}>
								アイテム (
								{shoppingListItems.filter((item) => item.isChecked).length} /{" "}
								{shoppingListItems.length})
							</Heading>
							{shoppingListItems.length === 0 ? (
								<Text color={textColor} fontStyle="italic">
									このリストにはアイテムがありません。
								</Text>
							) : (
								<List spacing={3} width="full">
									{shoppingListItems.map((item) => (
										<ListItem
											key={item.id}
											p={3}
											bg={useColorModeValue("gray.50", "gray.700")}
											rounded="lg"
											border="1px"
											borderColor={borderColor}
											onClick={() => handleItemCheck(item.id, item.isChecked)}
										>
											<Flex justify="space-between" align="center">
												<HStack spacing={3}>
													<Checkbox
														isChecked={item.isChecked}
														colorScheme="teal"
													>
														<Text
															fontWeight="semibold"
															color={headingColor}
															textDecoration={
																item.isChecked ? "line-through" : "none"
															}
															opacity={item.isChecked ? 0.7 : 1}
														>
															{item.ingredient}
														</Text>
													</Checkbox>
												</HStack>
												<Text
													color={textColor}
													fontWeight="medium"
													textDecoration={
														item.isChecked ? "line-through" : "none"
													}
													opacity={item.isChecked ? 0.7 : 1}
												>
													{item.amount}
												</Text>
											</Flex>
										</ListItem>
									))}
								</List>
							)}
						</VStack>
					</Card>
				</VStack>
			</Container>
		</Box>
	);
}
