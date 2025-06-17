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
	Text,
	VStack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	FaArrowLeft,
	FaCog,
	FaExclamationTriangle,
	FaRobot,
	FaYoutube,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate, useSearchParams } from "react-router";

import Header from "@/components/organisms/Header";
import { recipeUrlAtom, refreshRecipeListAtom } from "@/lib/atom/RecipeAtom";
import { useRecipeGenWebSocket } from "@/lib/hook/useRecipeGenWebSocket";
import { WebSocketMessage } from "@/lib/type/websocket";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

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

export default function RecipeAIGenPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const toast = useToast();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const [recipeUrl, setRecipeUrl] = useAtom(recipeUrlAtom);
	const refreshRecipe = useSetAtom(refreshRecipeListAtom);

	const [isProcessing, setIsProcessing] = useState(false);
	const [message, setMessage] = useState<string[]>([]);
	const [messageTimestamps, setMessageTimestamps] = useState<Date[]>([]);
	const [types, setTypes] = useState<string[]>([]);
	const [hasError, setHasError] = useState(false);
	const [progress, setProgress] = useState(0);

	// URL params から YouTube URL を取得
	const urlFromParams = searchParams.get("url");

	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, orange.900, pink.900, purple.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const headingColor = useColorModeValue("gray.800", "white");

	const shouldConnect = isProcessing && recipeUrl !== "";
	const handleWebSocketMessage = useCallback(
		(message: MessageEvent) => {
			if (message) {
				try {
					const parsedMessage = JSON.parse(message.data);
					const wsMessage = new WebSocketMessage(
						parsedMessage.type,
						parsedMessage.data,
						new Date(parsedMessage.timestamp),
						parsedMessage.session_id,
					);

					setTypes((prev) => [...prev, wsMessage.type]);
					const classifiedMessages = classifyWebSocketMessage(wsMessage);
					const timestamp = new Date();

					setMessage((prev) => [...prev, ...classifiedMessages]);
					setMessageTimestamps((prev) => [
						...prev,
						...classifiedMessages.map(() => timestamp),
					]);

					if (wsMessage.data.progress !== undefined) {
						setProgress(wsMessage.data.progress || 0);
					}

					// エラーの検出
					if (
						wsMessage.type === "error" ||
						wsMessage.data.content?.includes("エラー")
					) {
						setHasError(true);
						setIsProcessing(false);
						toast({
							title: "エラーが発生しました",
							description:
								"AI処理中にエラーが発生しました。再試行してください。",
							status: "error",
							duration: 5000,
							isClosable: true,
						});
					}
				} catch (error) {
					console.error("WebSocket message parsing error:", error);
					setHasError(true);
					setIsProcessing(false);
				}
			}
		},
		[toast],
	);
	const { connectionStatus, disconnect } = useRecipeGenWebSocket({
		onMessage: handleWebSocketMessage,
		shouldConnect: shouldConnect,
	});

	const statusInfo = webSocketStatus(connectionStatus);

	// 自動スクロール機能
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [message]);

	// AIProcessChatと同じ完了処理
	useEffect(() => {
		if (types.length > 0) {
			const type = types[types.length - 1];
			if (type === "all_tasks_completed") {
				refreshRecipe();
				setIsProcessing(false);
				disconnect();
				setRecipeUrl("");
				toast({
					title: "レシピ生成完了！",
					description: "新しいレシピがレシピ一覧に追加されました。",
					status: "success",
					duration: 5000,
					isClosable: true,
				});
				setTimeout(() => {
					navigate("/home");
				}, 2000);
			}
		}
	}, [types, refreshRecipe, disconnect, toast, navigate]);

	// 初期化処理（AIProcessChatと同じ）
	useEffect(() => {
		if (urlFromParams) {
			setMessage([]);
			setMessageTimestamps([]);
			setTypes([]);
			setHasError(false);
			setProgress(0);
			setRecipeUrl(urlFromParams);
			setIsProcessing(true);
		} else {
			// URLが指定されていない場合はホームに戻る
			navigate("/home");
		}
	}, [urlFromParams, setRecipeUrl, navigate]);

	const handleRetry = () => {
		setMessage([]);
		setMessageTimestamps([]);
		setTypes([]);
		setHasError(false);
		setProgress(0);
		setIsProcessing(true);
	};

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
				{/* Back button */}
				<Button
					leftIcon={<Icon as={FaArrowLeft} />}
					variant="ghost"
					onClick={() => navigate("/home")}
					mb={6}
					isDisabled={isProcessing && !hasError}
				>
					ホームに戻る
				</Button>

				{/* Header */}
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
						AIがYouTube動画を解析して、自動でレシピを生成しています
					</Text>

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
				</MotionVStack>
				{/* AI Status Card */}
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
						{/* AI Assistant Header */}
						<HStack spacing={3} w="full" justify="center">
							<Box p={2} bg="orange.100" rounded="full" position="relative">
								<Icon as={FaRobot} boxSize={6} color={statusInfo.color} />
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

						{/* Progress Bar */}
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

						{/* Error Display */}
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

						{/* Action Buttons */}
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
				{/* Messages Display */}
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

						<VStack spacing={4} align="stretch" maxH="500px" overflowY="auto">
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

							{/* システムメッセージ */}
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

							{/* Auto-scroll anchor */}
							<div ref={messagesEndRef} />
						</VStack>
					</Box>
				</MotionBox>
			</Container>
		</Box>
	);
}
