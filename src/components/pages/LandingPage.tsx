import { isLoggedInAtom } from "@/lib/atom/AuthAtom";
import {
	Badge,
	Box,
	Button,
	Container,
	Grid,
	GridItem,
	HStack,
	Heading,
	Icon,
	Text,
	VStack,
	useColorModeValue,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import {
	FaArrowRight,
	FaCookieBite,
	FaPlay,
	FaRobot,
	FaVideo,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { Link as RouterLink } from "react-router";

const LandingPage = () => {
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, orange.900, pink.900, purple.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");

	const isLoggedIn = useAtomValue(isLoggedInAtom);

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			{/* ヒーローセクション */}
			<Container maxW="7xl" pt={{ base: 20, md: 32 }} pb={{ base: 16, md: 24 }}>
				<VStack spacing={8} textAlign="center">
					<Box>
						<HStack justify="center" mb={6}>
							<Box
								bgGradient="linear(to-r, orange.400, pink.400)"
								p={4}
								rounded="full"
								shadow="lg"
							>
								<Icon as={FaCookieBite} boxSize={12} color="white" />
							</Box>
						</HStack>

						<Heading
							as="h1"
							size={{ base: "2xl", md: "4xl" }}
							bgGradient="linear(to-r, orange.500, pink.500)"
							bgClip="text"
							mb={4}
						>
							BAE-RECIPE
						</Heading>

						<Text
							fontSize={{ base: "xl", md: "2xl" }}
							fontWeight="semibold"
							color={useColorModeValue("gray.700", "gray.200")}
							mb={4}
						>
							使い尽くして「映える献立」を実現する
						</Text>

						<Text fontSize="lg" color={textColor} maxW="3xl" mx="auto" mb={8}>
							動画レシピをAIが自動で整理・要約。あなただけのレシピノートを作成します。
						</Text>
					</Box>

					<HStack spacing={4} flexWrap="wrap" justify="center">
						<Button
							as={RouterLink}
							to={isLoggedIn ? "/home" : "/auth/login"}
							size="lg"
							bgGradient="linear(to-r, orange.400, pink.400)"
							color="white"
							_hover={{
								bgGradient: "linear(to-r, orange.500, pink.500)",
								transform: "translateY(-2px)",
								shadow: "xl",
							}}
							rightIcon={<Icon as={FaArrowRight} />}
							transition="all 0.3s"
						>
							今すぐ始める
						</Button>

						<Button
							size="lg"
							variant="outline"
							colorScheme="orange"
							leftIcon={<Icon as={FaPlay} />}
						>
							デモを見る
						</Button>
					</HStack>
				</VStack>
			</Container>

			{/* 問題提起セクション */}
			<Box bg={cardBg} py={16}>
				<Container maxW="6xl">
					<VStack spacing={8} textAlign="center" mb={12}>
						<Heading size="xl" color={useColorModeValue("gray.800", "white")}>
							こんな経験ありませんか？
						</Heading>
						<Text fontSize="lg" color={textColor} maxW="4xl">
							SNSや動画サイトで見つけた「映える」レシピ。材料や手順が整理されておらず、
							調理中に何度も動画を確認して困ったことはありませんか？
						</Text>
					</VStack>

					<Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
						<GridItem>
							<Box
								bg={useColorModeValue("red.50", "red.900")}
								p={6}
								rounded="lg"
								textAlign="center"
								border="2px"
								borderColor={useColorModeValue("red.200", "red.700")}
							>
								<Icon as={FaVideo} boxSize={8} color="red.500" mb={4} />
								<Text fontWeight="bold" mb={2}>
									動画の繰り返し確認
								</Text>
								<Text fontSize="sm" color={textColor}>
									調理中に材料や手順を確認するため、何度も動画を見返す必要がある
								</Text>
							</Box>
						</GridItem>

						<GridItem>
							<Box
								bg={useColorModeValue("yellow.50", "yellow.900")}
								p={6}
								rounded="lg"
								textAlign="center"
								border="2px"
								borderColor={useColorModeValue("yellow.200", "yellow.700")}
							>
								<Icon as={HiSparkles} boxSize={8} color="yellow.500" mb={4} />
								<Text fontWeight="bold" mb={2}>
									情報の整理不足
								</Text>
								<Text fontSize="sm" color={textColor}>
									材料の分量や調理手順が動画内に散らばっており、把握が困難
								</Text>
							</Box>
						</GridItem>

						<GridItem>
							<Box
								bg={useColorModeValue("blue.50", "blue.900")}
								p={6}
								rounded="lg"
								textAlign="center"
								border="2px"
								borderColor={useColorModeValue("blue.200", "blue.700")}
							>
								<Icon as={FaCookieBite} boxSize={8} color="blue.500" mb={4} />
								<Text fontWeight="bold" mb={2}>
									レシピ管理の困難
								</Text>
								<Text fontSize="sm" color={textColor}>
									気に入ったレシピを保存・整理して、後で活用することが難しい
								</Text>
							</Box>
						</GridItem>
					</Grid>
				</Container>
			</Box>

			{/* ソリューションセクション */}
			<Container maxW="6xl" py={16}>
				<VStack spacing={12}>
					<VStack spacing={4} textAlign="center">
						<Badge
							colorScheme="orange"
							fontSize="md"
							px={3}
							py={1}
							rounded="full"
						>
							AI搭載ソリューション
						</Badge>
						<Heading size="xl" color={useColorModeValue("gray.800", "white")}>
							BAE-RECIPEが解決します
						</Heading>
						<Text fontSize="lg" color={textColor} maxW="4xl">
							AIを活用して動画レシピを自動で分析・整理。あなた専用のレシピノートを簡単に作成できます。
						</Text>
					</VStack>

					<Grid
						templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
						gap={12}
						alignItems="center"
					>
						<GridItem>
							<VStack spacing={6} align="start">
								<Box>
									<HStack mb={3}>
										<Icon as={FaRobot} boxSize={6} color="orange.500" />
										<Text fontWeight="bold" fontSize="lg">
											AI自動解析
										</Text>
									</HStack>
									<Text color={textColor}>
										動画URLを入力するだけで、AIが自動的に材料の分量、調理手順、映えるポイントを抽出します。
									</Text>
								</Box>

								<Box>
									<HStack mb={3}>
										<Icon as={HiSparkles} boxSize={6} color="pink.500" />
										<Text fontWeight="bold" fontSize="lg">
											整理された情報
										</Text>
									</HStack>
									<Text color={textColor}>
										散らばった情報を見やすく整理。調理中も簡単に確認できるレシピノートに変換します。
									</Text>
								</Box>

								<Box>
									<HStack mb={3}>
										<Icon as={FaCookieBite} boxSize={6} color="purple.500" />
										<Text fontWeight="bold" fontSize="lg">
											スマート管理
										</Text>
									</HStack>
									<Text color={textColor}>
										AIが自動でカテゴリ分類。最近のレシピや関連レシピを使って献立決定をサポートします。
									</Text>
								</Box>
							</VStack>
						</GridItem>

						<GridItem>
							<Box
								bg={cardBg}
								p={8}
								rounded="xl"
								shadow="xl"
								border="1px"
								borderColor={useColorModeValue("gray.200", "gray.600")}
							>
								<VStack spacing={4}>
									<Box
										w="full"
										h="200px"
										bg={useColorModeValue("gray.100", "gray.700")}
										rounded="lg"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Text color={textColor} fontStyle="italic">
											レシピノートプレビュー
										</Text>
									</Box>
									<Text fontSize="sm" color={textColor} textAlign="center">
										動画から抽出された整理済みレシピ情報
									</Text>
								</VStack>
							</Box>
						</GridItem>
					</Grid>
				</VStack>
			</Container>

			{/* 使い方セクション */}
			<Box bg={cardBg} py={16}>
				<Container maxW="6xl">
					<VStack spacing={8} textAlign="center" mb={12}>
						<Heading size="xl" color={useColorModeValue("gray.800", "white")}>
							簡単3ステップ
						</Heading>
						<Text fontSize="lg" color={textColor}>
							動画URLを入力するだけで、AIがあなた専用のレシピノートを作成します
						</Text>
					</VStack>

					<Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
						{[
							{
								step: "01",
								title: "動画URLを入力",
								description:
									"お気に入りのレシピ動画のURLをコピー&ペーストするだけ",
								icon: FaVideo,
								color: "orange",
							},
							{
								step: "02",
								title: "AI自動解析",
								description: "AIが動画を分析し、材料・手順・ポイントを抽出",
								icon: FaRobot,
								color: "pink",
							},
							{
								step: "03",
								title: "レシピノート完成",
								description: "整理されたレシピノートで簡単調理&献立管理",
								icon: FaCookieBite,
								color: "purple",
							},
						].map((item) => (
							<GridItem key={item.step} textAlign="center">
								<VStack spacing={4} textAlign="center">
									<Box position="relative">
										<Box
											bgGradient={`linear(to-r, ${item.color}.400, ${item.color}.600)`}
											w={16}
											h={16}
											rounded="full"
											display="flex"
											alignItems="center"
											justifyContent="center"
											mx="auto"
										>
											<Icon as={item.icon} boxSize={8} color="white" />
										</Box>
										<Badge
											position="absolute"
											top="-2"
											right="-2"
											colorScheme={item.color}
											rounded="full"
											fontSize="xs"
										>
											{item.step}
										</Badge>
									</Box>
									<Text fontWeight="bold" fontSize="lg">
										{item.title}
									</Text>
									<Text color={textColor} fontSize="sm">
										{item.description}
									</Text>
								</VStack>
							</GridItem>
						))}
					</Grid>
				</Container>
			</Box>

			{/* CTAセクション */}
			<Container maxW="6xl" py={16}>
				<Box
					bgGradient="linear(to-r, orange.400, pink.400)"
					p={12}
					rounded="2xl"
					textAlign="center"
					color="white"
				>
					<VStack spacing={6}>
						<Heading size="xl">今すぐBAE-RECIPEを始めよう</Heading>
						<Text fontSize="lg" opacity={0.9}>
							動画レシピをもっと簡単に、もっと楽しく。
							あなた専用のレシピノートで「映える献立」を実現しませんか？
						</Text>
						<Button
							as={RouterLink}
							to={isLoggedIn ? "/home" : "/auth/login"}
							size="lg"
							bg="white"
							color="orange.500"
							_hover={{
								transform: "translateY(-2px)",
								shadow: "xl",
							}}
							rightIcon={<Icon as={FaArrowRight} />}
						>
							無料で始める
						</Button>
					</VStack>
				</Box>
			</Container>
		</Box>
	);
};

export default LandingPage;
