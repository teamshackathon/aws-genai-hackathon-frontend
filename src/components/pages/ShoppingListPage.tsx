import {
	Box,
	Card,
	CardBody,
	Container,
	Flex,
	HStack,
	Heading,
	Icon,
	Spinner, // ローディング表示用
	Text,
	VStack,
	useColorModeValue,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaListAlt } from "react-icons/fa"; // アイコンをインポート
import { useNavigate } from "react-router"; // Linkの代わりにnavigateを使用

import Header from "@/components/organisms/Header";
import { shoppingListAtomLoadable } from "@/lib/atom/ShoppingAtom";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";

export default function ShoppingListPage() {
	const navigate = useNavigate();
	const shoppingLists = useLoadableAtom(shoppingListAtomLoadable);

	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const headingColor = useColorModeValue("gray.800", "white");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	if (shoppingLists === undefined) {
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

	if (shoppingLists === null) {
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

	return (
		<Box minH="100vh" bgGradient="linear(to-br, orange.50, pink.50, purple.50)">
			<Header />
			<Container maxW="4xl" py={8}>
				<VStack spacing={8} align="stretch">
					<Heading as="h1" size="xl" color={headingColor}>
						買い物リスト一覧
					</Heading>

					{shoppingLists?.items.length === 0 ? (
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
							{shoppingLists?.items.map((list) => (
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
					)}
				</VStack>
			</Container>
		</Box>
	);
}
