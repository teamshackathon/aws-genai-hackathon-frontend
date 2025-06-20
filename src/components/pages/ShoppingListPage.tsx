import {
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
	Spinner, // ローディング表示用
	Text,
	VStack,
	useColorModeValue,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaListAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa"; // アイコンをインポート
import { useNavigate } from "react-router"; // Linkの代わりにnavigateを使用
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import Header from "@/components/organisms/Header";
import { shoppingListAtomLoadable, shoppingListQueryParamAtom, shoppingListAtomAsync } from "@/lib/atom/ShoppingAtom";
import type { Shopping } from "@/lib/domain/ShoppingListQuery";

export default function ShoppingListPage() {
	const navigate = useNavigate();
	const shoppingLists = useAtomValue(shoppingListAtomLoadable);
	const [, setQueryParams] = useAtom(shoppingListQueryParamAtom);
	const refreshShoppingList = useSetAtom(shoppingListAtomAsync);

	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const headingColor = useColorModeValue("gray.800", "white");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	// ページ変更ハンドラー
	const handlePageChange = (newPage: number) => {
		setQueryParams(prev => ({ ...prev, page: newPage }));
		refreshShoppingList();
	};

	if (shoppingLists.state === "loading") {
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

	if (shoppingLists.state === "hasError") {
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
								エラーになります。
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

	if (shoppingLists.state === "hasData" && shoppingLists.data) {
		const data = shoppingLists.data;
		const items = data.items;
		const { page, pages, total, perPage } = data;
		
		return (
			<Box
				minH="100vh"
				bgGradient="linear(to-br, orange.50, pink.50, purple.50)"
			>
				<Header />
				<Container maxW="4xl" py={8}>
					<VStack spacing={8} align="stretch">
						<HStack justify="space-between" align="center">
							<Heading as="h1" size="xl" color={headingColor}>
								買い物リスト一覧
							</Heading>
							<Text color={textColor} fontSize="sm">
								{total}件中 {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)}件表示
							</Text>
						</HStack>

						{items.length === 0 ? (
							<Box textAlign="center" py={10}>
								<Text fontSize="xl" color={textColor} mb={4}>
									まだ買い物リストがありません。
								</Text>
								<Text color={textColor}>
									レシピページから新しい買い物リストを作成しましょう！
								</Text>
							</Box>
						) : (
							<>
								<VStack spacing={4} align="stretch">
									{items.map((list: Shopping) => (
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

								{/* ページネーション */}
								{pages > 1 && (
									<HStack justify="center" spacing={2} mt={8}>
										<IconButton
											aria-label="前のページ"
											icon={<FaChevronLeft />}
											onClick={() => handlePageChange(page - 1)}
											isDisabled={page <= 1}
											variant="outline"
											size="sm"
										/>
										
										{/* ページ番号ボタン */}
										{Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => {
											// 現在のページ周辺のみ表示
											if (
												pageNum === 1 ||
												pageNum === pages ||
												(pageNum >= page - 2 && pageNum <= page + 2)
											) {
												return (
													<Button
														key={pageNum}
														size="sm"
														onClick={() => handlePageChange(pageNum)}
														colorScheme={pageNum === page ? "teal" : "gray"}
														variant={pageNum === page ? "solid" : "outline"}
													>
														{pageNum}
													</Button>
												);
											}
											
											// 省略記号
											if (pageNum === page - 3 || pageNum === page + 3) {
												return (
													<Text key={pageNum} color={textColor} px={2}>
														...
													</Text>
												);
											}
											
											return null;
										})}
										
										<IconButton
											aria-label="次のページ"
											icon={<FaChevronRight />}
											onClick={() => handlePageChange(page + 1)}
											isDisabled={page >= pages}
											variant="outline"
											size="sm"
										/>
									</HStack>
								)}
							</>
						)}
					</VStack>
				</Container>
			</Box>
		);
	}

	return null;
}
