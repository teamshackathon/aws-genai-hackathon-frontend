// React Hooks & Utils
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

// UI Components
import {
	Box,
	Button,
	CircularProgress,
	Container,
	Flex,
	HStack,
	Heading,
	Icon,
	Progress,
	SimpleGrid,
	Text,
	VStack,
	useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

// Icons
import {
	FaArrowLeft,
	FaCog,
	FaExclamationTriangle,
	FaRobot,
	FaYoutube,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

// State Management
import { useAtom, useSetAtom } from "jotai";

// Components & Hooks
import Header from "@/components/organisms/Header";
import { toastAtom } from "@/lib/atom/BaseAtom";
import { recipeUrlAtom, refreshRecipeListAtom } from "@/lib/atom/RecipeAtom";
import { useRecipeGenWebSocket } from "@/lib/hook/useRecipeGenWebSocket";
import type { RecipeParameters } from "@/lib/type/RecipeParameters";
import { WebSocketMessage } from "@/lib/type/websocket";

// Framer Motion コンポーネントの定義
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

/**
 * WebSocketの接続状態に応じてステータス情報を返す関数
 * @param status WebSocketの接続状態
 * @returns アイコン、テキスト、カラーの情報
 */
function webSocketStatus(status: string) {
	switch (status) {
		case "Connecting":
			return {
				icon: <Icon as={FaRobot} boxSize={4} color="orange.500" />,
				text: "接続中...",
				color: "orange.500",
			};
		case "Open":
			return {
				icon: <Icon as={FaRobot} boxSize={4} color="green.500" />,
				text: "オンライン",
				color: "green.500",
			};
		case "Closing":
			return {
				icon: <Icon as={FaRobot} boxSize={4} color="red.500" />,
				text: "切断中...",
				color: "red.500",
			};
		case "Closed":
			return {
				icon: <Icon as={FaRobot} boxSize={4} color="gray.500" />,
				text: "オフライン",
				color: "gray.500",
			};
		default:
			return {
				icon: <Icon as={FaRobot} boxSize={4} color="gray.500" />,
				text: "不明",
				color: "gray.500",
			};
	}
}

/**
 * WebSocketメッセージを種類別に分類し、表示用のコンテンツに変換する関数
 * AIProcessChatコンポーネントと同じロジックを使用
 * @param message WebSocketMessage オブジェクト
 * @returns 表示用の文字列配列
 */
// WebSocketに送られたメッセージをtypeごとに分類するための関数（AIProcessChatと同じ）
function classifyWebSocketMessage(message: WebSocketMessage) {
	const type = message.type || "unknown";
	const contents: string[] = [];
	switch (type) {
		case "system_response":
			contents.push(message.data.content);
			return contents;
		case "user_input":
			contents.push(message.data.content);
			return contents;
		case "task_started":
			contents.push(`${message.data.content}`);
			return contents;
		case "task_progress":
			contents.push(`${message.data.content}`);
			return contents;
		case "task_completed":
			contents.push(`${message.data.content}`);
			return contents;
		case "all_tasks_completed":
			contents.push(`${message.data.content}`);
			return contents;
		case "session_history":
			for (const item of message.data.messages) {
				const subMessage = new WebSocketMessage(
					item.type,
					{
						content: item.content,
						metadata: item.metadata,
						session_id: message.sessionId,
					},
					new Date(item.timestamp),
					message.sessionId,
				);
				contents.push(...classifyWebSocketMessage(subMessage));
			}
			return contents;
		default:
			console.warn("Unknown message type:", type);
			return [];
	}
}

/**
 * AIレシピ生成ページのメインコンポーネント
 * YouTube動画URLからAIが自動でレシピを生成する過程をリアルタイムで表示
 * WebSocketを使用してAI処理の進行状況をユーザーに提供
 */
export default function RecipeAIGenPage() {
	// ルーティング関連
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	// 状態管理 - Atoms
	const setToastState = useSetAtom(toastAtom);
	const [recipeUrl, setRecipeUrl] = useAtom(recipeUrlAtom);
	const refreshRecipe = useSetAtom(refreshRecipeListAtom);

	// 状態管理 - ローカルstate
	const [isProcessing, setIsProcessing] = useState(false); // AI処理実行中フラグ
	const [message, setMessage] = useState<string[]>([]); // AI処理ログメッセージ
	const [messageTimestamps, setMessageTimestamps] = useState<Date[]>([]); // メッセージのタイムスタンプ
	const [, setTypes] = useState<string[]>([]); // メッセージタイプ（デバッグ用）
	const [hasError, setHasError] = useState(false); // エラー発生フラグ
	const [progress, setProgress] = useState(0); // 処理進行状況（0-100%）
	const [recipeParams, setRecipeParams] = useState<RecipeParameters | null>(
		null,
	); // MainPageから受け取ったレシピパラメータ

	// refs
	const messagesEndRef = useRef<HTMLDivElement>(null); // 自動スクロール用

	// URL params から YouTube URL を取得
	const urlFromParams = searchParams.get("url");

	// テーマ対応のカラー設定
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, orange.900, pink.900, purple.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const headingColor = useColorModeValue("gray.800", "white");

	// WebSocket接続の条件判定
	const shouldConnect = isProcessing && recipeUrl !== "";

	/**
	 * WebSocketメッセージ受信時のコールバック関数
	 * AI処理の進行状況やエラー、完了通知を処理
	 */
	const handleWebSocketMessage = useCallback((message: MessageEvent) => {
		if (message) {
			try {
				// WebSocketメッセージをパース
				const parsedMessage = JSON.parse(message.data);
				const wsMessage = new WebSocketMessage(
					parsedMessage.type,
					parsedMessage.data,
					new Date(parsedMessage.timestamp),
					parsedMessage.session_id,
				);

				// メッセージタイプを記録（デバッグ用）
				setTypes((prev) => [...prev, wsMessage.type]);

				// メッセージを分類して表示用コンテンツに変換
				const classifiedMessages = classifyWebSocketMessage(wsMessage);
				const timestamp = new Date();

				// 表示用メッセージとタイムスタンプを更新
				setMessage((prev) => [...prev, ...classifiedMessages]);
				setMessageTimestamps((prev) => [
					...prev,
					...classifiedMessages.map(() => timestamp),
				]);

				// 進行状況の更新
				if (wsMessage.data.progress !== undefined) {
					setProgress(wsMessage.data.progress || 0);
				}

				// エラーハンドリング
				if (
					wsMessage.type === "error" ||
					wsMessage.data.content?.includes("エラー")
				) {
					setHasError(true);
					setIsProcessing(false);
					setToastState({
						title: "エラーが発生しました",
						description: wsMessage.data.content || "不明なエラー",
						status: "error",
						duration: 5000,
						isClosable: true,
					});
				}

				// 全タスク完了時の処理
				if (wsMessage.type === "all_tasks_completed") {
					refreshRecipe(); // レシピ一覧を更新
					setIsProcessing(false);
					disconnect();
					setRecipeUrl("");
					setToastState({
						title: "レシピ生成完了！",
						description: "新しいレシピがレシピ一覧に追加されました。",
						status: "success",
						duration: 5000,
						isClosable: true,
					});
					// 2秒後にホームページに自動遷移
					setTimeout(() => {
						navigate("/home");
					}, 2000);
				}
			} catch (error) {
				console.error("WebSocket message parsing error:", error);
				setHasError(true);
				setIsProcessing(false);
			}
		}
	}, []);

	// WebSocket接続フックの初期化
	const { connectionStatus, disconnect } = useRecipeGenWebSocket({
		onMessage: handleWebSocketMessage,
		shouldConnect: shouldConnect,
		recipeParams: recipeParams,
	});

	// WebSocket接続状態の表示情報を取得
	const statusInfo = webSocketStatus(connectionStatus);

	/**
	 * メッセージが追加されるたびに自動スクロールする
	 */
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [message]);

	/**
	 * コンポーネント初期化時の処理
	 * URLパラメータからYouTube URLを取得し、AI処理を開始
	 * MainPageから渡されたrecipeParamsも取得
	 */
	// 初期化処理（AIProcessChatと同じ）
	useEffect(() => {
		if (urlFromParams) {
			// 状態をリセットしてAI処理を開始
			setMessage([]);
			setMessageTimestamps([]);
			setTypes([]);
			setHasError(false);
			setProgress(0);
			setRecipeUrl(urlFromParams);
			setIsProcessing(true);

			// MainPageから渡されたrecipeParamsを取得
			const receivedRecipeParams = location.state
				?.recipeParams as RecipeParameters;
			if (receivedRecipeParams) {
				setRecipeParams(receivedRecipeParams);
				console.log(
					"MainPageから受け取ったレシピパラメータ:",
					receivedRecipeParams,
				);
			} else {
				console.log("デフォルトのレシピパラメータを使用します");
			}
		} else {
			// URLが指定されていない場合はホームに戻る
			navigate("/home");
		}
	}, [urlFromParams, setRecipeUrl, navigate, location.state]);

	/**
	 * エラー発生時の再試行処理
	 */
	const handleRetry = () => {
		setMessage([]);
		setMessageTimestamps([]);
		setTypes([]);
		setHasError(false);
		setProgress(0);
		setIsProcessing(true);
	};

	/**
	 * AI処理のキャンセル処理
	 */
	const handleCancel = () => {
		disconnect();
		setIsProcessing(false);
		setHasError(false);
		setRecipeUrl("");
		navigate("/home");
	};

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			<Header />

			<Container maxW="4xl" py={8}>
				{/* ===== ナビゲーション ===== */}
				{/* ホームに戻るボタン */}
				<Button
					leftIcon={<Icon as={FaArrowLeft} />}
					variant="ghost"
					onClick={() => navigate("/home")}
					mb={6}
					isDisabled={isProcessing && !hasError}
				>
					ホームに戻る
				</Button>

				{/* ===== ページヘッダー ===== */}
				{/* AIレシピ生成のタイトルと説明 */}
				<MotionVStack
					spacing={6}
					textAlign="center"
					mb={8}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<HStack spacing={3}>
						<Icon as={HiSparkles} boxSize={8} color="orange.500" />
						<Heading
							size="xl"
							bgGradient="linear(to-r, orange.500, pink.500)"
							bgClip="text"
						>
							AI レシピ生成
						</Heading>
						<Icon as={HiSparkles} boxSize={8} color="pink.500" />
					</HStack>

					<Text fontSize="lg" color={textColor} maxW="2xl">
						AIがYouTube動画を分析して、自動でレシピを生成しています
					</Text>

					{/* 処理中のYouTube URL表示 */}
					{recipeUrl && (
						<HStack
							spacing={2}
							bg={cardBg}
							p={3}
							rounded="lg"
							border="1px"
							borderColor={borderColor}
						>
							<Icon as={FaYoutube} color="red.500" />
							<Text fontSize="sm" color={textColor} isTruncated maxW="400px">
								{recipeUrl}
							</Text>
						</HStack>
					)}

					{/* カスタム生成設定表示 */}
					{recipeParams && (
						<VStack
							spacing={3}
							bg={cardBg}
							p={4}
							rounded="lg"
							border="1px"
							borderColor={borderColor}
							w="full"
							maxW="600px"
						>
							<Text fontSize="sm" fontWeight="semibold" color={textColor}>
								🎯 カスタム生成設定
							</Text>
							<SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} w="full">
								{/* 人数設定 - 常に表示 */}
								<VStack spacing={1}>
									<Text fontSize="xs" color={textColor}>
										人数
									</Text>
									<Text fontSize="sm" fontWeight="medium">
										{recipeParams.peopleCount === "1"
											? "1人"
											: recipeParams.peopleCount === "2"
												? "2人"
												: recipeParams.peopleCount === "3"
													? "3人"
													: recipeParams.peopleCount === "4"
														? "4人"
														: recipeParams.peopleCount === "5"
															? "5人"
															: recipeParams.peopleCount === "6"
																? "6人"
																: "レシピ通り"}
									</Text>
								</VStack>

								{/* 調理時間 - 常に表示 */}
								<VStack spacing={1}>
									<Text fontSize="xs" color={textColor}>
										調理時間
									</Text>
									<Text fontSize="sm" fontWeight="medium">
										{recipeParams.cookingTime}
									</Text>
								</VStack>

								{/* 重視する傾向 - 常に表示 */}
								<VStack spacing={1}>
									<Text fontSize="xs" color={textColor}>
										重視する傾向
									</Text>
									<Text fontSize="sm" fontWeight="medium">
										{recipeParams.preference}
									</Text>
								</VStack>

								{/* 塩味 - 常に表示 */}
								<VStack spacing={1}>
									<Text fontSize="xs" color={textColor}>
										塩味
									</Text>
									<Text fontSize="sm" fontWeight="medium">
										{recipeParams.saltiness === "薄味"
											? "薄め"
											: recipeParams.saltiness}
									</Text>
								</VStack>

								{/* 甘味 - 常に表示 */}
								<VStack spacing={1}>
									<Text fontSize="xs" color={textColor}>
										甘味
									</Text>
									<Text fontSize="sm" fontWeight="medium">
										{recipeParams.sweetness}
									</Text>
								</VStack>

								{/* 辛み - 常に表示 */}
								<VStack spacing={1}>
									<Text fontSize="xs" color={textColor}>
										辛み
									</Text>
									<Text fontSize="sm" fontWeight="medium">
										{recipeParams.spiciness}
									</Text>
								</VStack>
							</SimpleGrid>

							{/* 嫌いな食材 - 常に表示（値がない場合は「なし」） */}
							<VStack spacing={1} w="full">
								<Text fontSize="xs" color={textColor}>
									嫌いな食材
								</Text>
								<Text fontSize="sm" fontWeight="medium" textAlign="center">
									{recipeParams.dislikedIngredients || "なし"}
								</Text>
							</VStack>
						</VStack>
					)}
				</MotionVStack>

				{/* ===== AI処理ステータスカード ===== */}
				{/* WebSocket接続状態、進行状況、エラー表示、アクションボタン */}
				<MotionBox
					bg={cardBg}
					p={6}
					rounded="2xl"
					shadow="xl"
					border="1px"
					borderColor={borderColor}
					mb={8}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<VStack spacing={6}>
						{/* AI アシスタントヘッダー（接続状態表示） */}
						<HStack spacing={3} w="full" justify="center">
							<Box p={2} bg="orange.100" rounded="full" position="relative">
								<Icon as={FaRobot} boxSize={6} color={statusInfo.color} />
								{/* 接続状態インジケーター */}
								<Box
									position="absolute"
									top={1}
									right={1}
									w={3}
									h={3}
									bg={statusInfo.color}
									rounded="full"
									border="2px"
									borderColor={cardBg}
								/>
							</Box>
							<VStack align="start" spacing={0}>
								<Heading size="md" color={headingColor}>
									AI レシピアシスタント
								</Heading>
								<HStack spacing={1}>
									{statusInfo.icon}
									<Text
										fontSize="sm"
										color={statusInfo.color}
										fontWeight="medium"
									>
										{statusInfo.text}
									</Text>
								</HStack>
							</VStack>
						</HStack>

						{/* 進行状況バー */}
						{isProcessing && (
							<VStack w="full" spacing={2}>
								<Progress
									value={progress}
									colorScheme="orange"
									w="full"
									h={2}
									rounded="full"
									bg={useColorModeValue("gray.100", "gray.700")}
								/>
								<Text fontSize="xs" color={textColor}>
									処理進行状況: {Math.round(progress)}%
								</Text>
							</VStack>
						)}

						{/* エラー表示 */}
						{hasError && (
							<Box
								w="full"
								p={4}
								bg={useColorModeValue("red.50", "red.900")}
								border="1px"
								borderColor={useColorModeValue("red.200", "red.700")}
								rounded="lg"
							>
								<HStack spacing={2}>
									<Icon as={FaExclamationTriangle} color="red.500" />
									<Text
										color={useColorModeValue("red.700", "red.200")}
										fontSize="sm"
									>
										AI処理中にエラーが発生しました
									</Text>
								</HStack>
							</Box>
						)}

						{/* アクションボタン（再試行・ホームに戻る） */}
						{(!isProcessing || hasError) && (
							<HStack spacing={4}>
								{hasError && (
									<Button
										leftIcon={<Icon as={FaCog} />}
										colorScheme="orange"
										onClick={handleRetry}
									>
										再試行
									</Button>
								)}
								<Button variant="outline" onClick={handleCancel}>
									ホームに戻る
								</Button>
							</HStack>
						)}
					</VStack>
				</MotionBox>

				{/* ===== AI処理ログ表示 ===== */}
				{/* WebSocketメッセージのリアルタイム表示 */}
				<MotionBox
					bg={cardBg}
					rounded="2xl"
					shadow="xl"
					border="1px"
					borderColor={borderColor}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Box p={6}>
						<Heading size="md" color={headingColor} mb={6}>
							AI処理ログ
						</Heading>

						{/* メッセージ表示エリア */}
						<VStack spacing={4} align="stretch" maxH="500px" overflowY="auto">
							{/* メッセージがない場合の表示 */}
							{message.length === 0 ? (
								<VStack spacing={4} py={8}>
									<Text color={textColor} textAlign="center">
										{isProcessing
											? "🔄 AI処理実行中..."
											: "✨ AI処理が開始されました"}
									</Text>
									<Text fontSize="xs" color={textColor} textAlign="center">
										{isProcessing
											? "AI処理の進行状況をリアルタイムで表示します"
											: "処理が完了しました"}
									</Text>
								</VStack>
							) : (
								/* メッセージ一覧表示 */
								message.map((msg, index) => {
									const timestamp = messageTimestamps[index] || new Date();
									return (
										<MotionBox
											key={index}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: index * 0.1 }}
										>
											<Flex justify="start">
												{/* 個別メッセージバブル */}
												<Box
													maxW="80%"
													bg={useColorModeValue("blue.100", "blue.700")}
													p={4}
													rounded="lg"
													roundedBottomLeft="sm"
													position="relative"
												>
													<Text
														fontSize="sm"
														color={useColorModeValue("blue.800", "white")}
														lineHeight={1.6}
													>
														{msg}
													</Text>
													{/* タイムスタンプ */}
													<Text fontSize="xs" color={textColor} mt={2}>
														{timestamp.toLocaleTimeString("ja-JP", {
															hour: "2-digit",
															minute: "2-digit",
															second: "2-digit",
														})}
													</Text>
												</Box>
											</Flex>
										</MotionBox>
									);
								})
							)}

							{/* 処理中インジケーター */}
							{isProcessing && (
								<Flex justify="center" mt={4}>
									<HStack
										spacing={2}
										bg={useColorModeValue("gray.50", "gray.750")}
										px={4}
										py={2}
										rounded="full"
									>
										<CircularProgress
											size="16px"
											color="orange.500"
											isIndeterminate
										/>
										<Text fontSize="xs" color={textColor}>
											AI処理実行中...
										</Text>
									</HStack>
								</Flex>
							)}

							{/* 自動スクロール用アンカー */}
							<div ref={messagesEndRef} />
						</VStack>
					</Box>
				</MotionBox>
			</Container>
		</Box>
	);
}
