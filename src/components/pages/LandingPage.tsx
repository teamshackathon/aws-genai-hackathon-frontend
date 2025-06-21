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
	useDisclosure,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import {
	FaArrowRight,
	FaFileAlt,
	FaPlay,
	FaRegFrown,
	FaRegSadTear,
	FaRegTired,
	FaRobot,
	FaSadTear,
	FaVideo,
} from "react-icons/fa";
import {
	FaDoorOpen,
	FaKey,
	FaSignInAlt,
	FaUserLock,
	FaUserShield,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { Link as RouterLink } from "react-router";

import DemoVideoModal from "@/components/organisms/DemoVideoModal";

const LandingPage = () => {
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, orange.900, pink.900, purple.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");

	const isLoggedIn = useAtomValue(isLoggedInAtom);
	const {
		isOpen: isDemoModalOpen,
		onOpen: onDemoModalOpen,
		onClose: onDemoModalClose,
	} = useDisclosure();

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
								<Box
									as="img"
									src="/bae-recipe/favicon.svg"
									alt="BAE RECIPE Icon"
									boxSize={12}
								/>
							</Box>
						</HStack>
						<HStack justify="center" spacing={3} w="100%" overflow={"visible"}>
							<Box
								as="img"
								src="/bae-recipe/bae-recipe-logo_orange.svg"
								alt="Bae Recipe Logo"
								height={{ base: "60px", md: "100px" }}
								maxH={{ base: "60px", md: "100px" }}
								maxW="100%"
								width="auto"
								objectFit={"contain"}
								display="block"
								mx="auto"
								my={0}
							/>
						</HStack>
						<Text
							fontSize={{ base: "xl", md: "2xl" }}
							fontWeight="semibold"
							color={useColorModeValue("gray.700", "gray.200")}
							mb={4}
						>
							「作りたい」が、もっと広がる。
						</Text>

						<Text fontSize="lg" color={textColor} maxW="3xl" mx="auto" mb={8}>
							AIが動画レシピを自動で分析、整理して
							<br />
							あなた専用のレシピノートを作成します！
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
							onClick={onDemoModalOpen}
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
						<Icon as={FaRegSadTear} boxSize={10} color="red.500" ml={2} />
						<Heading size="xl" color={useColorModeValue("gray.800", "white")}>
							「もっとスムーズに作れたらいいのに！」
						</Heading>

						<Text fontSize="lg" color={textColor} maxW="4xl">
							SNSや動画サイトで見つけた魅力的な「映えレシピ」
							<br />
							でも、いざ作ろうと思っても
							<br />
							レシピ動画をどこに保存したか忘れてしまう…
							<br />
							調理中に何度も動画を一時停止したり巻き戻したり…
							<br />
							<br />
							こんな悩みはありませんか？
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
									レシピ動画の繰り返し確認が面倒
								</Text>
								<Text fontSize="sm" color={textColor}>
									調理工程ごとの材料や手順を、何度も一時停止して見返さないといけない
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
								<Icon as={FaFileAlt} boxSize={8} color="yellow.500" mb={4} />
								<Text fontWeight="bold" mb={2}>
									レシピ情報の整理不足
								</Text>
								<Text fontSize="sm" color={textColor}>
									材料の分量や調理手順が動画内に散らばっていて、把握が困難
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
								<Icon as={FaSignInAlt} boxSize={8} color="blue.500" mb={4} />
								<Text fontWeight="bold" mb={2}>
									レシピ動画へのアクセスが困難
								</Text>
								<Text fontSize="sm" color={textColor}>
									せっかく気に入ったレシピを保存しても、すぐに見つからない
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
							Bae Recipeが解決します✨
						</Heading>
						<Text fontSize="lg" color={textColor} maxW="4xl">
							私たちのサービスは、単なるメモアプリではありません。
							<br />
							以下3つの主要な機能で、日々の料理を強力にサポートします。
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
										<Icon as={FaRobot} boxSize={6} color="pink.500" />
										<Text fontWeight="bold" fontSize="lg">
											AI自動分析
										</Text>
									</HStack>
									<Text color={textColor}>
										動画URLを入れるだけで、AIが材料、手順、映えポイントを自動抽出。
										<br />
										もう、動画の一時停止や巻き戻しで戸惑うことはありません。
									</Text>
								</Box>

								<Box>
									<HStack mb={3}>
										<Icon as={FaFileAlt} boxSize={6} color="purple.500" />
										<Text fontWeight="bold" fontSize="lg">
											整理されたレシピノート
										</Text>
									</HStack>
									<Text color={textColor}>
										抽出された情報は、調理中でも見やすいように整理。
										<br />
										散らばりがちな動画情報があなた仕様にまとまります。
									</Text>
								</Box>

								<Box>
									<HStack mb={3}>
										<Icon as={HiSparkles} boxSize={6} color="yellow.500" />
										<Text fontWeight="bold" fontSize="lg">
											スマート管理
										</Text>
									</HStack>
									<Text color={textColor}>
										作成されたレシピノートは、AIが自動でカテゴリ分類。
										<br />
										最近のレシピや関連レシピを瞬時に見つけ出しスムーズに料理を始められます。
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
										rounded="lg"
										overflow="hidden"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Box
											as="img"
											src="/bae-recipe/preview.gif"
											alt="レシピノートプレビュー"
											w="full"
											h="full"
											objectFit="cover"
											rounded="lg"
										/>
									</Box>
									<Text fontSize="sm" color={textColor} textAlign="center">
										動画から抽出されたレシピ例
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
							簡単3ステップ！
						</Heading>
						<Text fontSize="lg" color={textColor}>
							動画URLを入力するだけで、AIがあなた専用のレシピノートを作成します
						</Text>
					</VStack>

					<Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
						{[
							{
								step: "step 1",
								title: "動画URLを入力",
								description: "作りたいレシピ動画のURLをコピー&ペーストするだけ",
								icon: FaVideo,
								color: "orange",
								isCustomIcon: false,
							},
							{
								step: "step 2",
								title: "AI自動分析",
								description: "AIが動画から材料・手順・ポイントを抽出",
								icon: FaRobot,
								color: "pink",
								isCustomIcon: false,
							},
							{
								step: "step 3",
								title: "レシピノート完成",
								description: "あなた仕様のレシピノートで簡単調理 & レシピ管理",
								icon: null,
								color: "purple",
								isCustomIcon: true,
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
											{item.isCustomIcon ? (
												<Box
													as="img"
													src="/bae-recipe/favicon.svg"
													alt="BAE RECIPE Icon"
													boxSize={8}
												/>
											) : item.icon ? (
												<Icon as={item.icon} boxSize={8} color="white" />
											) : null}
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
						<Heading size="xl">今すぐBae Recipeを始めよう</Heading>
						<Text fontSize="lg" opacity={0.9}>
							動画レシピをもっと手軽に、もっと楽しく。
							<br />
							AIが作るあなた専用のレシピノートで
							<br />
							「作りたい」気持ちを、そのまま料理に。
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

			{/* Demo Video Modal */}
			<DemoVideoModal isOpen={isDemoModalOpen} onClose={onDemoModalClose} />
		</Box>
	);
};

export default LandingPage;
