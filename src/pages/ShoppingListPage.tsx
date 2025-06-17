import {
	Box,
	Card,
	CardBody,
	Container,
	Flex,
	HStack,
	Heading,
	Icon,
	Spacer,
	Spinner, // ローディング表示用
	Text,
	VStack,
	useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaListAlt, FaUtensils } from "react-icons/fa"; // アイコンをインポート
import { useNavigate } from "react-router-dom"; // Linkの代わりにnavigateを使用

import Header from "@/components/organisms/Header";
import { getUserId } from "@/lib/auth/authUtils";
import { getShoppingLists } from "@/lib/domain/ShoppingListQuery";
import type { ShoppingListSummary } from "@/lib/domain/ShoppingListQuery"; // 型定義をインポート

export default function ShoppingListPage() {
	const navigate = useNavigate();
	const [shoppingLists, setShoppingLists] = useState<ShoppingListSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const headingColor = useColorModeValue("gray.800", "white");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	useEffect(() => {
		const fetchShoppingLists = async () => {
			setIsLoading(true);
			setError(null);
			const userId = getUserId(); // 仮のユーザーIDを取得

			try {
				const data = await getShoppingLists(userId);
				// 作成日時の新しい順にソート（必要であれば）
				const sortedData = data.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
				setShoppingLists(sortedData);
			} catch (err: any) {
				setError(err.message || "買い物リストの読み込みに失敗しました。");
				console.error("Failed to fetch shopping lists:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchShoppingLists();
	}, []); // 依存配列が空なので、コンポーネトマウント時に一度だけ実行

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
							買い物リスト一覧
						</Heading>
						<Flex justify="center" align="center" minH="300px">
							<Spinner size="xl" color="teal.500" />
							<Text ml={4} fontSize="lg" color={textColor}>
								買い物リストを読み込み中...
							</Text>
						</Flex>
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
							買い物リスト一覧
						</Heading>
						<Box textAlign="center" py={10}>
							<Text color="red.500" fontSize="lg" mb={4}>
								エラー: {error}
							</Text>
							<Text color={textColor}>
								リストの取得中に問題が発生しました。
							</Text>
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
					<Heading as="h1" size="xl" color={headingColor}>
						買い物リスト一覧
					</Heading>

					{shoppingLists.length === 0 ? (
						<Box textAlign="center" py={10}>
							<Text fontSize="xl" color={textColor} mb={4}>
								まだ買い物リストがありません。
							</Text>
							<Text color={textColor}>
								レシピページから新しい買い物リストを作成しましょう！
							</Text>
						</Box>
					) : (
						<VStack spacing={4} align="stretch">
							{shoppingLists.map((list) => (
								<Card
									key={list.id}
									bg={cardBg}
									shadow="md"
									rounded="lg"
									border="1px"
									borderColor={borderColor}
									_hover={{
										shadow: "lg",
										transform: "translateY(-2px)",
										cursor: "pointer",
									}}
									transition="all 0.2s ease-in-out"
									onClick={() => navigate(`/home/shopping_list/${list.id}`)}
								>
									<CardBody p={5}>
										<VStack align="stretch" spacing={2}>
											<HStack>
												<Icon as={FaListAlt} color="teal.500" boxSize={5} />
												<Heading size="md" color={headingColor}>
													{list.listName}
												</Heading>
											</HStack>
											{list.recipeName && (
												<HStack fontSize="sm" color={textColor}>
													<Icon as={FaUtensils} />
													<Text>関連レシピ: {list.recipeName}</Text>
												</HStack>
											)}
											<HStack fontSize="sm" color={textColor}>
												<Icon as={FaCalendarAlt} />
												<Text>
													作成日:{" "}
													{new Date(list.createdAt).toLocaleDateString()}
												</Text>
											</HStack>
										</VStack>
									</CardBody>
								</Card>
							))}
						</VStack>
					)}
				</VStack>
			</Container>
		</Box>
	);
}
