import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Container,
	Divider,
	FormControl,
	FormHelperText,
	FormLabel,
	Grid,
	GridItem,
	HStack,
	Heading,
	Icon,
	Select,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Switch,
	Text,
	VStack,
	useColorMode,
	useColorModeValue,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import {
	FaBell,
	FaCog,
	FaDownload,
	FaExclamationTriangle,
	FaEye,
	FaGlobe,
	FaLanguage,
	FaLock,
	FaMoon,
	FaPalette,
	FaSave,
	FaShieldAlt,
	FaSun,
	FaTrash,
	FaUndo,
	FaUserShield,
} from "react-icons/fa";

import Header from "@/components/organisms/Header";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

interface SettingsData {
	notifications: {
		email: boolean;
		push: boolean;
		recipeUpdates: boolean;
		newsletter: boolean;
	};
	appearance: {
		theme: string;
		fontSize: number;
		language: string;
		animations: boolean;
	};
	privacy: {
		profileVisibility: string;
		dataCollection: boolean;
		cookieSettings: boolean;
		shareAnalytics: boolean;
	};
	account: {
		twoFactorAuth: boolean;
		sessionTimeout: number;
		downloadData: boolean;
	};
}

export default function SettingPage() {
	const toast = useToast();
	const { colorMode, toggleColorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isLoading, setIsLoading] = useState(false);
	const cancelRef = useRef<HTMLButtonElement>(null);

	// Color values
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, gray.900, gray.800, gray.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const headingColor = useColorModeValue("gray.800", "white");

	// Settings state
	const [settings, setSettings] = useState<SettingsData>({
		notifications: {
			email: true,
			push: false,
			recipeUpdates: true,
			newsletter: false,
		},
		appearance: {
			theme: colorMode,
			fontSize: 16,
			language: "ja",
			animations: true,
		},
		privacy: {
			profileVisibility: "public",
			dataCollection: true,
			cookieSettings: true,
			shareAnalytics: false,
		},
		account: {
			twoFactorAuth: false,
			sessionTimeout: 30,
			downloadData: false,
		},
	});

	const handleSave = async () => {
		setIsLoading(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: "設定を保存しました",
				description: "変更が正常に適用されました。",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			toast({
				title: "保存に失敗しました",
				description: "もう一度お試しください。",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setSettings({
			notifications: {
				email: true,
				push: false,
				recipeUpdates: true,
				newsletter: false,
			},
			appearance: {
				theme: "light",
				fontSize: 16,
				language: "ja",
				animations: true,
			},
			privacy: {
				profileVisibility: "public",
				dataCollection: true,
				cookieSettings: true,
				shareAnalytics: false,
			},
			account: {
				twoFactorAuth: false,
				sessionTimeout: 30,
				downloadData: false,
			},
		});

		toast({
			title: "設定をリセットしました",
			description: "全ての設定がデフォルトに戻りました。",
			status: "info",
			duration: 3000,
			isClosable: true,
		});
	};

	const handleDeleteAccount = () => {
		onClose();
		toast({
			title: "アカウント削除要求を受け付けました",
			description: "確認メールを送信しました。",
			status: "warning",
			duration: 5000,
			isClosable: true,
		});
	};

	const settingSections = [
		{
			id: "notifications",
			title: "通知設定",
			description: "お知らせやアップデートの受信設定",
			icon: FaBell,
			color: "blue",
		},
		{
			id: "appearance",
			title: "表示設定",
			description: "テーマや言語などの外観設定",
			icon: FaPalette,
			color: "purple",
		},
		{
			id: "privacy",
			title: "プライバシー",
			description: "データ使用とプライバシーの設定",
			icon: FaShieldAlt,
			color: "green",
		},
		{
			id: "account",
			title: "アカウント",
			description: "セキュリティとアカウント管理",
			icon: FaUserShield,
			color: "red",
		},
	];

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			<Header />

			<Container maxW="6xl" py={8}>
				<MotionBox
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					{/* ページヘッダー */}
					<VStack spacing={6} align="start" mb={8}>
						<HStack spacing={4}>
							<Box
								bgGradient="linear(to-r, orange.400, pink.400)"
								p={3}
								rounded="xl"
								shadow="lg"
							>
								<Icon as={FaCog} boxSize={8} color="white" />
							</Box>
							<VStack align="start" spacing={1}>
								<Heading size="xl" color={headingColor}>
									設定
								</Heading>
								<Text color={textColor} fontSize="lg">
									アプリケーションの動作をカスタマイズできます
								</Text>
							</VStack>
						</HStack>
					</VStack>

					<Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
						{/* サイドバーナビゲーション */}
						<GridItem>
							<MotionCard
								bg={cardBg}
								shadow="xl"
								rounded="2xl"
								border="1px"
								borderColor={borderColor}
								initial={{ opacity: 0, x: -50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								position="sticky"
								top="100px"
							>
								<CardBody p={6}>
									<VStack spacing={4} align="stretch">
										{settingSections.map((section, index) => (
											<MotionBox
												key={section.id}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
											>
												<HStack
													p={4}
													rounded="xl"
													cursor="pointer"
													transition="all 0.3s"
													_hover={{
														bg: useColorModeValue(
															`${section.color}.50`,
															`${section.color}.900`,
														),
														transform: "translateX(4px)",
													}}
													onClick={() => {
														document
															.getElementById(section.id)
															?.scrollIntoView({
																behavior: "smooth",
																block: "start",
															});
													}}
												>
													<Icon
														as={section.icon}
														boxSize={5}
														color={`${section.color}.500`}
													/>
													<VStack align="start" spacing={0} flex={1}>
														<Text fontWeight="semibold" fontSize="sm">
															{section.title}
														</Text>
														<Text fontSize="xs" color={textColor} noOfLines={2}>
															{section.description}
														</Text>
													</VStack>
												</HStack>
											</MotionBox>
										))}
									</VStack>
								</CardBody>
							</MotionCard>
						</GridItem>

						{/* メインコンテンツ */}
						<GridItem>
							<VStack spacing={8} align="stretch">
								{/* 通知設定 */}
								<MotionCard
									id="notifications"
									bg={cardBg}
									shadow="xl"
									rounded="2xl"
									border="1px"
									borderColor={borderColor}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.4 }}
								>
									<CardHeader pb={4}>
										<HStack spacing={4}>
											<Icon as={FaBell} boxSize={6} color="blue.500" />
											<VStack align="start" spacing={1}>
												<Heading size="lg" color={headingColor}>
													通知設定
												</Heading>
												<Text color={textColor}>
													受信したい通知の種類を選択してください
												</Text>
											</VStack>
										</HStack>
									</CardHeader>
									<CardBody pt={0}>
										<VStack spacing={6} align="stretch">
											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">メール通知</Text>
													<Text fontSize="sm" color={textColor}>
														重要な更新をメールで受信
													</Text>
												</VStack>
												<Switch
													isChecked={settings.notifications.email}
													onChange={(e) =>
														setSettings({
															...settings,
															notifications: {
																...settings.notifications,
																email: e.target.checked,
															},
														})
													}
													colorScheme="blue"
													size="lg"
												/>
											</HStack>

											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">プッシュ通知</Text>
													<Text fontSize="sm" color={textColor}>
														リアルタイムでお知らせを受信
													</Text>
												</VStack>
												<Switch
													isChecked={settings.notifications.push}
													onChange={(e) =>
														setSettings({
															...settings,
															notifications: {
																...settings.notifications,
																push: e.target.checked,
															},
														})
													}
													colorScheme="blue"
													size="lg"
												/>
											</HStack>

											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">レシピ更新通知</Text>
													<Text fontSize="sm" color={textColor}>
														新しいレシピや更新の通知
													</Text>
												</VStack>
												<Switch
													isChecked={settings.notifications.recipeUpdates}
													onChange={(e) =>
														setSettings({
															...settings,
															notifications: {
																...settings.notifications,
																recipeUpdates: e.target.checked,
															},
														})
													}
													colorScheme="blue"
													size="lg"
												/>
											</HStack>

											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">ニュースレター</Text>
													<Text fontSize="sm" color={textColor}>
														料理のヒントやコツを定期的に受信
													</Text>
												</VStack>
												<Switch
													isChecked={settings.notifications.newsletter}
													onChange={(e) =>
														setSettings({
															...settings,
															notifications: {
																...settings.notifications,
																newsletter: e.target.checked,
															},
														})
													}
													colorScheme="blue"
													size="lg"
												/>
											</HStack>
										</VStack>
									</CardBody>
								</MotionCard>

								{/* 表示設定 */}
								<MotionCard
									id="appearance"
									bg={cardBg}
									shadow="xl"
									rounded="2xl"
									border="1px"
									borderColor={borderColor}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.5 }}
								>
									<CardHeader pb={4}>
										<HStack spacing={4}>
											<Icon as={FaPalette} boxSize={6} color="purple.500" />
											<VStack align="start" spacing={1}>
												<Heading size="lg" color={headingColor}>
													表示設定
												</Heading>
												<Text color={textColor}>
													アプリの外観をカスタマイズできます
												</Text>
											</VStack>
										</HStack>
									</CardHeader>
									<CardBody pt={0}>
										<VStack spacing={6} align="stretch">
											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">ダークモード</Text>
													<Text fontSize="sm" color={textColor}>
														目に優しいダークテーマを使用
													</Text>
												</VStack>
												<HStack>
													<Icon as={FaSun} color="yellow.500" />
													<Switch
														isChecked={colorMode === "dark"}
														onChange={toggleColorMode}
														colorScheme="purple"
														size="lg"
													/>
													<Icon as={FaMoon} color="purple.500" />
												</HStack>
											</HStack>

											<FormControl>
												<FormLabel fontWeight="semibold">
													フォントサイズ
												</FormLabel>
												<HStack spacing={4}>
													<Text fontSize="sm">小</Text>
													<Slider
														flex={1}
														value={settings.appearance.fontSize}
														min={12}
														max={24}
														step={2}
														onChange={(value) =>
															setSettings({
																...settings,
																appearance: {
																	...settings.appearance,
																	fontSize: value,
																},
															})
														}
														colorScheme="purple"
													>
														<SliderTrack>
															<SliderFilledTrack />
														</SliderTrack>
														<SliderThumb boxSize={6}>
															<Icon as={FaEye} />
														</SliderThumb>
													</Slider>
													<Text fontSize="sm">大</Text>
												</HStack>
												<FormHelperText>
													現在のサイズ: {settings.appearance.fontSize}px
												</FormHelperText>
											</FormControl>

											<FormControl>
												<FormLabel fontWeight="semibold">言語</FormLabel>
												<Select
													value={settings.appearance.language}
													onChange={(e) =>
														setSettings({
															...settings,
															appearance: {
																...settings.appearance,
																language: e.target.value,
															},
														})
													}
													icon={<FaLanguage />}
												>
													<option value="ja">日本語</option>
													<option value="en">English</option>
													<option value="ko">한국어</option>
													<option value="zh">中文</option>
												</Select>
											</FormControl>

											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">アニメーション</Text>
													<Text fontSize="sm" color={textColor}>
														スムーズなアニメーション効果を有効にする
													</Text>
												</VStack>
												<Switch
													isChecked={settings.appearance.animations}
													onChange={(e) =>
														setSettings({
															...settings,
															appearance: {
																...settings.appearance,
																animations: e.target.checked,
															},
														})
													}
													colorScheme="purple"
													size="lg"
												/>
											</HStack>
										</VStack>
									</CardBody>
								</MotionCard>

								{/* プライバシー設定 */}
								<MotionCard
									id="privacy"
									bg={cardBg}
									shadow="xl"
									rounded="2xl"
									border="1px"
									borderColor={borderColor}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.6 }}
								>
									<CardHeader pb={4}>
										<HStack spacing={4}>
											<Icon as={FaShieldAlt} boxSize={6} color="green.500" />
											<VStack align="start" spacing={1}>
												<Heading size="lg" color={headingColor}>
													プライバシー設定
												</Heading>
												<Text color={textColor}>
													データの使用とプライバシーを管理
												</Text>
											</VStack>
										</HStack>
									</CardHeader>
									<CardBody pt={0}>
										<VStack spacing={6} align="stretch">
											<FormControl>
												<FormLabel fontWeight="semibold">
													プロフィール公開設定
												</FormLabel>
												<Select
													value={settings.privacy.profileVisibility}
													onChange={(e) =>
														setSettings({
															...settings,
															privacy: {
																...settings.privacy,
																profileVisibility: e.target.value,
															},
														})
													}
													icon={<FaGlobe />}
												>
													<option value="public">公開</option>
													<option value="friends">友達のみ</option>
													<option value="private">非公開</option>
												</Select>
											</FormControl>

											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">データ収集を許可</Text>
													<Text fontSize="sm" color={textColor}>
														サービス改善のためのデータ使用を許可
													</Text>
												</VStack>
												<Switch
													isChecked={settings.privacy.dataCollection}
													onChange={(e) =>
														setSettings({
															...settings,
															privacy: {
																...settings.privacy,
																dataCollection: e.target.checked,
															},
														})
													}
													colorScheme="green"
													size="lg"
												/>
											</HStack>

											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">Cookie設定</Text>
													<Text fontSize="sm" color={textColor}>
														必要なCookieの使用を許可
													</Text>
												</VStack>
												<Switch
													isChecked={settings.privacy.cookieSettings}
													onChange={(e) =>
														setSettings({
															...settings,
															privacy: {
																...settings.privacy,
																cookieSettings: e.target.checked,
															},
														})
													}
													colorScheme="green"
													size="lg"
												/>
											</HStack>

											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<Text fontWeight="semibold">分析データの共有</Text>
													<Text fontSize="sm" color={textColor}>
														匿名化された使用データの共有を許可
													</Text>
												</VStack>
												<Switch
													isChecked={settings.privacy.shareAnalytics}
													onChange={(e) =>
														setSettings({
															...settings,
															privacy: {
																...settings.privacy,
																shareAnalytics: e.target.checked,
															},
														})
													}
													colorScheme="green"
													size="lg"
												/>
											</HStack>
										</VStack>
									</CardBody>
								</MotionCard>

								{/* アカウント設定 */}
								<MotionCard
									id="account"
									bg={cardBg}
									shadow="xl"
									rounded="2xl"
									border="1px"
									borderColor={borderColor}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.7 }}
								>
									<CardHeader pb={4}>
										<HStack spacing={4}>
											<Icon as={FaUserShield} boxSize={6} color="red.500" />
											<VStack align="start" spacing={1}>
												<Heading size="lg" color={headingColor}>
													アカウント設定
												</Heading>
												<Text color={textColor}>
													セキュリティとアカウント管理
												</Text>
											</VStack>
										</HStack>
									</CardHeader>
									<CardBody pt={0}>
										<VStack spacing={6} align="stretch">
											<HStack justify="space-between">
												<VStack align="start" spacing={1}>
													<HStack>
														<Text fontWeight="semibold">二段階認証</Text>
														<Badge colorScheme="orange" size="sm">
															推奨
														</Badge>
													</HStack>
													<Text fontSize="sm" color={textColor}>
														アカウントのセキュリティを強化
													</Text>
												</VStack>
												<Switch
													isChecked={settings.account.twoFactorAuth}
													onChange={(e) =>
														setSettings({
															...settings,
															account: {
																...settings.account,
																twoFactorAuth: e.target.checked,
															},
														})
													}
													colorScheme="red"
													size="lg"
												/>
											</HStack>

											<FormControl>
												<FormLabel fontWeight="semibold">
													セッションタイムアウト
												</FormLabel>
												<HStack spacing={4}>
													<Text fontSize="sm">15分</Text>
													<Slider
														flex={1}
														value={settings.account.sessionTimeout}
														min={15}
														max={120}
														step={15}
														onChange={(value) =>
															setSettings({
																...settings,
																account: {
																	...settings.account,
																	sessionTimeout: value,
																},
															})
														}
														colorScheme="red"
													>
														<SliderTrack>
															<SliderFilledTrack />
														</SliderTrack>
														<SliderThumb boxSize={6}>
															<Icon as={FaLock} />
														</SliderThumb>
													</Slider>
													<Text fontSize="sm">2時間</Text>
												</HStack>
												<FormHelperText>
													現在の設定: {settings.account.sessionTimeout}分
												</FormHelperText>
											</FormControl>

											<Divider />

											<VStack spacing={4} align="stretch">
												<Heading size="md" color={headingColor}>
													危険な操作
												</Heading>

												<HStack
													justify="space-between"
													p={4}
													bg={useColorModeValue("orange.50", "orange.900")}
													rounded="lg"
												>
													<VStack align="start" spacing={1}>
														<Text fontWeight="semibold">
															データのダウンロード
														</Text>
														<Text fontSize="sm" color={textColor}>
															アカウントの全データをダウンロード
														</Text>
													</VStack>
													<Button
														leftIcon={<FaDownload />}
														colorScheme="orange"
														variant="outline"
														size="sm"
													>
														ダウンロード
													</Button>
												</HStack>

												<HStack
													justify="space-between"
													p={4}
													bg={useColorModeValue("red.50", "red.900")}
													rounded="lg"
												>
													<VStack align="start" spacing={1}>
														<Text fontWeight="semibold" color="red.500">
															アカウント削除
														</Text>
														<Text fontSize="sm" color={textColor}>
															この操作は取り消せません
														</Text>
													</VStack>
													<Button
														leftIcon={<FaTrash />}
														colorScheme="red"
														variant="outline"
														size="sm"
														onClick={onOpen}
													>
														削除
													</Button>
												</HStack>
											</VStack>
										</VStack>
									</CardBody>
								</MotionCard>

								{/* 保存・リセットボタン */}
								<MotionCard
									bg={cardBg}
									shadow="xl"
									rounded="2xl"
									border="1px"
									borderColor={borderColor}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.8 }}
								>
									<CardBody>
										<HStack spacing={4} justify="flex-end">
											<MotionButton
												leftIcon={<FaUndo />}
												variant="outline"
												colorScheme="gray"
												onClick={handleReset}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												リセット
											</MotionButton>
											<MotionButton
												leftIcon={<FaSave />}
												colorScheme="orange"
												bgGradient="linear(to-r, orange.400, pink.400)"
												color="white"
												onClick={handleSave}
												isLoading={isLoading}
												loadingText="保存中..."
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												_hover={{
													bgGradient: "linear(to-r, orange.500, pink.500)",
												}}
											>
												設定を保存
											</MotionButton>
										</HStack>
									</CardBody>
								</MotionCard>
							</VStack>
						</GridItem>
					</Grid>
				</MotionBox>
			</Container>

			{/* アカウント削除の確認ダイアログ */}
			<AlertDialog
				isOpen={isOpen}
				leastDestructiveRef={cancelRef}
				onClose={onClose}
			>
				<AlertDialogOverlay backdropFilter="blur(4px)">
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							<HStack>
								<Icon as={FaExclamationTriangle} color="red.500" />
								<Text>アカウント削除の確認</Text>
							</HStack>
						</AlertDialogHeader>

						<AlertDialogBody>
							<VStack spacing={4} align="start">
								<Text>
									本当にアカウントを削除しますか？この操作は取り消すことができません。
								</Text>
								<Box
									p={4}
									bg={useColorModeValue("red.50", "red.900")}
									rounded="lg"
									w="full"
								>
									<Text fontSize="sm" color="red.500" fontWeight="semibold">
										削除されるデータ：
									</Text>
									<VStack align="start" spacing={1} mt={2}>
										<Text fontSize="sm">• プロフィール情報</Text>
										<Text fontSize="sm">• 保存したレシピ</Text>
										<Text fontSize="sm">• お気に入りリスト</Text>
										<Text fontSize="sm">• 使用履歴</Text>
									</VStack>
								</Box>
							</VStack>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onClose}>
								キャンセル
							</Button>
							<Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>
								削除する
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Box>
	);
}
