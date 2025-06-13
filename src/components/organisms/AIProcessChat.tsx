import { useRecipeGenWebSocket } from "@/lib/hook/useRecipeGenWebSocket";
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
import { useCallback, useState } from "react";
import { FaChevronDown, FaChevronUp, FaRobot, FaTimes } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

const MotionBox = motion(Box);

interface AIProcessChatProps {
	isOpen: boolean;
	isProcessing: boolean;
	onClose: () => void;
}

export default function AIProcessChat({
	isOpen,
	isProcessing,
	onClose,
}: AIProcessChatProps) {
	const [isMinimized, setIsMinimized] = useState(false);

	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const [message, setMessage] = useState<string[]>([]);

	const handleWebSocketMessage = useCallback((message: any) => {
		if (message.data) {
			setMessage((prev) => [...prev, message.data]);
		}
	}, []);
	const { lastMessage, connectionStatus, readyState } = useRecipeGenWebSocket({
		onMessage: handleWebSocketMessage,
		shouldConnect: isProcessing,
	});

	if (!isOpen) return null;

	const handleToggleMinimize = () => {
		setIsMinimized(!isMinimized);
	};

	const handleClose = () => {
		setIsMinimized(false);
		onClose();
	};

	console.log("WebSocket Connection Status:", connectionStatus);
	console.log("WebSocket Ready State:", readyState);
	console.log(
		"Last Message:",
		lastMessage ? lastMessage.data : "No messages received",
	);
	console.log("Current Messages:", message);

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
							<Icon as={FaRobot} boxSize={5} color="orange.500" />
							<Box
								position="absolute"
								top={1}
								right={1}
								w={2}
								h={2}
								bg={isProcessing ? "orange.400" : "green.400"}
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
								<Icon
									as={HiSparkles}
									boxSize={3}
									color={isProcessing ? "orange.400" : "green.400"}
								/>
								<Text
									fontSize="xs"
									color={isProcessing ? "orange.500" : "green.500"}
									fontWeight="medium"
								>
									{isProcessing ? "処理中..." : "オンライン"}
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
								{/* AIメッセージ */}
								<Flex justify="start">
									<Box
										maxW="80%"
										bg={useColorModeValue("gray.100", "gray.700")}
										p={3}
										rounded="lg"
										roundedBottomLeft="sm"
										position="relative"
									>
										<Text
											fontSize="sm"
											color={useColorModeValue("gray.800", "white")}
										>
											Hello World! 🌟
										</Text>
										<Text fontSize="sm" mt={2} color={textColor}>
											AIレシピアシスタントです。動画の解析を開始しますか？
										</Text>
										<Text fontSize="xs" color={textColor} mt={1}>
											{new Date().toLocaleTimeString("ja-JP", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</Text>
									</Box>
								</Flex>

								{/* WebSocketからのメッセージを表示 */}
								{message.map((msg, index) => (
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
								))}

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
