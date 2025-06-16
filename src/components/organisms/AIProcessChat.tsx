import { recipeUrlAtom, refreshRecipeListAtom } from "@/lib/atom/RecipeAtom";
import { useRecipeGenWebSocket } from "@/lib/hook/useRecipeGenWebSocket";
import { WebSocketMessage } from "@/lib/type/websocket";
import {
	Box,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Text,
	VStack,
	useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaRobot, FaTimes } from "react-icons/fa";

const MotionBox = motion(Box);

interface AIProcessChatProps {
	isOpen: boolean;
	isProcessing: boolean;
	setIsProcessing: (isProcessing: boolean) => void;
	onClose: () => void;
}

function webSocketStatus(status: string) {
	switch (status) {
		case "Connecting":
			return {
				icon: <Icon as={FaRobot} boxSize={3} color="orange.500" />,
				text: "接続中...",
				color: "orange.500",
			};
		case "Open":
			return {
				icon: <Icon as={FaRobot} boxSize={3} color="green.500" />,
				text: "オンライン",
				color: "green.500",
			};
		case "Closing":
			return {
				icon: <Icon as={FaRobot} boxSize={3} color="red.500" />,
				text: "切断中...",
				color: "red.500",
			};
		case "Closed":
			return {
				icon: <Icon as={FaRobot} boxSize={3} color="gray.500" />,
				text: "オフライン",
				color: "gray.500",
			};
		default:
			return {
				icon: <Icon as={FaRobot} boxSize={3} color="gray.500" />,
				text: "不明",
				color: "gray.500",
			};
	}
}

// WebSocketに送られたメッセージをtypeごとに分類するための関数
function classifyWebSocketMessage(message: WebSocketMessage) {
	const type = message.type || "unknown";
	const contents: string[] = [];
	switch (type) {
		case "connection_established":
			contents.push(message.data.content);
			return contents;
		case "system_response":
			contents.push(message.data.content);
			return contents;
		case "user_input":
			contents.push(message.data.content);
			return contents;
		case "task_started":
			contents.push(`タスクが開始されました: ${message.data.content}`);
			return contents;
		case "task_progress":
			contents.push(`タスクの進行状況: ${message.data.content}`);
			return contents;
		case "task_completed":
			contents.push(`タスクが完了しました: ${message.data.content}`);
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

export default function AIProcessChat({
	isOpen,
	isProcessing,
	setIsProcessing,
	onClose,
}: AIProcessChatProps) {
	const [isMinimized, setIsMinimized] = useState(false);
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const [message, setMessage] = useState<string[]>([]);
	const [types, setTypes] = useState<string[]>([]);
	const [recipeUrl, setRecipeUrl] = useAtom(recipeUrlAtom);
	const refreshRecipe = useSetAtom(refreshRecipeListAtom);

	const shouldConnect = isProcessing && recipeUrl !== "";

	const handleWebSocketMessage = useCallback((message: MessageEvent) => {
		if (message) {
			// JSON.parseを使用してメッセージを解析
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
				setMessage((prev) => [...prev, ...classifiedMessages]);
			} catch (error) {
				return;
			}
		}
	}, []);
	const { connectionStatus, disconnect } = useRecipeGenWebSocket({
		onMessage: handleWebSocketMessage,
		shouldConnect: shouldConnect,
	});

	const handleToggleMinimize = () => {
		setIsMinimized(!isMinimized);
	};

	const handleClose = () => {
		setIsMinimized(false);
		onClose();
	};

	useEffect(() => {
		if (types.length > 0) {
			const type = types[types.length - 1];
			// 最後のメッセージが"AI処理が開始されました"であれば、最小化状態にする
			if (type === "task_completed") {
				refreshRecipe();
				setIsMinimized(false);
				setIsProcessing(false);
				disconnect();
			}
		}
	}, [types]);

	// 初回レンダリング時にメッセージをクリア
	useEffect(() => {
		if (isOpen) {
			setMessage([]);
			setTypes([]);
			setRecipeUrl("");
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<MotionBox
			position="fixed"
			right={4}
			top="50%"
			transform="translateY(-50%)"
			w="400px"
			h={isMinimized ? "auto" : "600px"}
			bg={bgColor}
			border="1px"
			borderColor={borderColor}
			rounded="xl"
			shadow="2xl"
			zIndex={1000}
			initial={{ opacity: 0, x: 100 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 100 }}
			transition={{ duration: 0.3 }}
		>
			<VStack h="full" spacing={0}>
				{/* ヘッダー */}
				<Flex
					w="full"
					p={4}
					borderBottom={isMinimized ? "none" : "1px"}
					borderColor={borderColor}
					justify="space-between"
					align="center"
					bg={useColorModeValue("gray.50", "gray.700")}
					roundedTop="xl"
					roundedBottom={isMinimized ? "xl" : "none"}
				>
					<HStack spacing={3}>
						<Box p={2} bg="orange.100" rounded="full" position="relative">
							<Icon
								as={FaRobot}
								boxSize={5}
								color={webSocketStatus(connectionStatus).color}
							/>
							<Box
								position="absolute"
								top={1}
								right={1}
								w={2}
								h={2}
								bg={webSocketStatus(connectionStatus).color}
								rounded="full"
								border="2px"
								borderColor={bgColor}
							/>
						</Box>
						<VStack align="start" spacing={0}>
							<Heading size="sm" color={useColorModeValue("gray.800", "white")}>
								AI レシピアシスタント
							</Heading>
							<HStack spacing={1}>
								{webSocketStatus(connectionStatus).icon}
								<Text
									fontSize="xs"
									color={webSocketStatus(connectionStatus).color}
									fontWeight="medium"
								>
									{webSocketStatus(connectionStatus).text}
								</Text>
							</HStack>
						</VStack>
					</HStack>
					<HStack spacing={1}>
						{isProcessing ? (
							<IconButton
								aria-label={isMinimized ? "チャットを展開" : "チャットを最小化"}
								icon={<Icon as={isMinimized ? FaChevronUp : FaChevronDown} />}
								size="sm"
								variant="ghost"
								onClick={handleToggleMinimize}
								_hover={{
									bg: useColorModeValue("gray.200", "gray.600"),
								}}
							/>
						) : (
							<IconButton
								aria-label="チャットを閉じる"
								icon={<Icon as={FaTimes} />}
								size="sm"
								variant="ghost"
								onClick={handleClose}
								_hover={{
									bg: useColorModeValue("gray.200", "gray.600"),
								}}
							/>
						)}
					</HStack>
				</Flex>

				{/* チャット内容 - 最小化時は非表示 */}
				{!isMinimized && (
					<>
						{" "}
						<Box flex={1} w="full" p={4} overflowY="auto">
							<VStack spacing={4} align="stretch">
								{/* WebSocketからのメッセージを表示 */}
								{message.map((msg, index) => {
									return (
										<Flex key={index} justify="start">
											<Box
												maxW="80%"
												bg={useColorModeValue("blue.100", "blue.700")}
												p={3}
												rounded="lg"
												roundedBottomLeft="sm"
												position="relative"
											>
												<Text
													fontSize="sm"
													color={useColorModeValue("blue.800", "white")}
												>
													{msg}
												</Text>
												<Text fontSize="xs" color={textColor} mt={1}>
													{new Date().toLocaleTimeString("ja-JP", {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</Text>
											</Box>
										</Flex>
									);
								})}

								{/* システムメッセージ */}
								<Flex justify="center">
									<Text
										fontSize="xs"
										color={textColor}
										bg={useColorModeValue("gray.50", "gray.750")}
										px={3}
										py={1}
										rounded="full"
									>
										{isProcessing
											? "🔄 AI処理実行中..."
											: "✨ AI処理が開始されました"}
									</Text>
								</Flex>
							</VStack>
						</Box>
						{/* フッター */}
						<Box
							w="full"
							p={4}
							borderTop="1px"
							borderColor={borderColor}
							bg={useColorModeValue("gray.50", "gray.700")}
							roundedBottom="xl"
						>
							<Text fontSize="xs" color={textColor} textAlign="center">
								{isProcessing
									? "AI処理の進行状況をリアルタイムで表示します"
									: "処理が完了しました"}
							</Text>
						</Box>
					</>
				)}
			</VStack>
		</MotionBox>
	);
}
