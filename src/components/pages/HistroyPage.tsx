import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Collapse,
	Container,
	Divider,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	SimpleGrid,
	Spinner,
	Text,
	Tooltip,
	VStack,
	useColorModeValue,
	useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
	FaChevronDown,
	FaChevronUp,
	FaClock,
	FaHistory,
	FaRobot,
	FaUser,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { IoRefresh } from "react-icons/io5";

import Header from "@/components/organisms/Header";
import { sessionHistoryListAtomLoadable } from "@/lib/atom/SessionAtom";
import { useLoadableAtom } from "@/lib/hook/useLoadableAtom";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// メッセージタイプに応じたアイコンとカラー
const getMessageTypeConfig = (messageType: string) => {
	switch (messageType) {
		case "user":
			return { icon: FaUser, color: "blue", label: "ユーザー" };
		case "ai":
		case "assistant":
			return { icon: FaRobot, color: "purple", label: "AI" };
		case "system":
			return { icon: HiSparkles, color: "green", label: "システム" };
		default:
			return { icon: FaHistory, color: "gray", label: "その他" };
	}
};

// 日時フォーマット関数
const formatDateTime = (date: Date) => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / (1000 * 60));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (minutes < 1) return "たった今";
	if (minutes < 60) return `${minutes}分前`;
	if (hours < 24) return `${hours}時間前`;
	if (days < 7) return `${days}日前`;

	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

// セッションカードコンポーネント
interface SessionCardProps {
	historySession: {
		sessionId: string;
		messages: Array<{
			messageId: string;
			messageType: string;
			content: string;
			metadata: Record<string, any>;
			timestamp: Date;
		}>;
		createdAt: Date;
		updatedAt: Date;
	};
	sessionIndex: number;
	cardBg: string;
	borderColor: string;
	textColor: string;
	mutedColor: string;
	accentColor: string;
}

const SessionCard = ({
	historySession,
	sessionIndex,
	cardBg,
	borderColor,
	textColor,
	mutedColor,
	accentColor,
}: SessionCardProps) => {
	const { isOpen, onToggle } = useDisclosure();

	// セッション内のメッセージタイプの統計を計算
	const messageStats = historySession.messages.reduce(
		(acc, msg) => {
			acc[msg.messageType] = (acc[msg.messageType] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	// 最初のユーザーメッセージをプレビューとして取得
	const firstUserMessage = historySession.messages.find(
		(msg) => msg.messageType === "user",
	);
	const previewText = firstUserMessage?.content
		? firstUserMessage.content.slice(0, 100) +
			(firstUserMessage.content.length > 100 ? "..." : "")
		: "メッセージなし";

	return (
		<VStack key={`session-${sessionIndex}`} spacing={4} w="100%">
			{/* セッション情報ヘッダー */}
			<MotionCard
				bg={cardBg}
				borderColor={borderColor}
				borderWidth={1}
				w="100%"
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4 }}
				cursor="pointer"
				onClick={onToggle}
				_hover={{ transform: "translateY(-2px)", shadow: "md" }}
			>
				{" "}
				<CardHeader>
					<VStack align="stretch" spacing={3}>
						<HStack justify="space-between">
							<HStack spacing={3}>
								<Icon as={HiSparkles} color={accentColor} boxSize={5} />
								<VStack align="start" spacing={1}>
									<Text fontWeight="bold" color={textColor}>
										セッション: {historySession.sessionId}
									</Text>
									<Text fontSize="xs" color={mutedColor}>
										作成日時: {formatDateTime(historySession.createdAt)}
									</Text>
								</VStack>
							</HStack>
							<HStack spacing={3}>
								<Badge colorScheme="purple" variant="subtle">
									{historySession.messages.length} メッセージ
								</Badge>
								<Button
									size="sm"
									variant="ghost"
									colorScheme="purple"
									leftIcon={<Icon as={isOpen ? FaChevronUp : FaChevronDown} />}
								>
									{isOpen ? "非表示" : "表示"}
								</Button>
							</HStack>
						</HStack>

						{/* プレビューテキスト */}
						{!isOpen && (
							<Box pl={8}>
								<Text fontSize="sm" color={mutedColor} noOfLines={2}>
									💬 プレビュー: {previewText}
								</Text>
								<HStack spacing={2} mt={2}>
									{Object.entries(messageStats).map(([type, count]) => {
										const config = getMessageTypeConfig(type);
										return (
											<Badge
												key={type}
												colorScheme={config.color}
												variant="outline"
												size="sm"
											>
												{config.label}: {count}
											</Badge>
										);
									})}
								</HStack>
							</Box>
						)}
					</VStack>
				</CardHeader>
			</MotionCard>

			{/* メッセージ履歴（Collapse内） */}
			<Collapse in={isOpen} animateOpacity style={{ width: "100%" }}>
				<VStack spacing={4} w="100%">
					<Text fontSize="sm" color={mutedColor} alignSelf="start" ml={4}>
						📝 セッション内のメッセージ一覧:
					</Text>
					<SimpleGrid columns={1} spacing={4} w="100%">
						{historySession.messages.map((message, index) => (
							<MessageCard
								key={`${message.messageId}-${index}`}
								message={message}
								index={index}
								cardBg={cardBg}
								borderColor={borderColor}
								textColor={textColor}
								mutedColor={mutedColor}
							/>
						))}
					</SimpleGrid>
				</VStack>
			</Collapse>
		</VStack>
	);
};

// メッセージカードコンポーネント
interface MessageCardProps {
	message: {
		messageId: string;
		messageType: string;
		content: string;
		metadata: Record<string, any>;
		timestamp: Date;
	};
	index: number;
	cardBg: string;
	borderColor: string;
	textColor: string;
	mutedColor: string;
}

const MessageCard = ({
	message,
	index,
	cardBg,
	borderColor,
	textColor,
	mutedColor,
}: MessageCardProps) => {
	const { isOpen, onToggle } = useDisclosure();
	const config = getMessageTypeConfig(message.messageType);
	return (
		<MotionCard
			key={`${message.messageId}-${index}`}
			bg={cardBg}
			borderColor={borderColor}
			borderWidth={1}
			borderLeftWidth={4}
			borderLeftColor={`${config.color}.300`}
			ml={4}
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.4, delay: index * 0.1 }}
			_hover={{ transform: "translateY(-2px)", shadow: "lg" }}
		>
			<CardBody>
				<VStack align="stretch" spacing={3}>
					{/* ヘッダー部分 - 常に表示 */}
					<HStack justify="space-between">
						<HStack spacing={3}>
							<Icon
								as={config.icon}
								color={`${config.color}.500`}
								boxSize={4}
							/>
							<Badge colorScheme={config.color} variant="subtle">
								{config.label}
							</Badge>
							<Text fontSize="sm" color={mutedColor}>
								ID: {message.messageId}
							</Text>
						</HStack>
						<HStack spacing={2}>
							<Icon as={FaClock} boxSize={3} color={mutedColor} />
							<Text fontSize="sm" color={mutedColor}>
								{formatDateTime(message.timestamp)}
							</Text>
							<Button
								size="sm"
								variant="ghost"
								colorScheme={config.color}
								onClick={onToggle}
								leftIcon={<Icon as={isOpen ? FaChevronUp : FaChevronDown} />}
							>
								{isOpen ? "非表示" : "詳細"}
							</Button>
						</HStack>
					</HStack>

					{/* 折りたたみ可能な詳細部分 */}
					<Collapse in={isOpen} animateOpacity>
						<VStack align="stretch" spacing={3}>
							<Divider />

							<Box>
								<Text
									color={textColor}
									whiteSpace="pre-wrap"
									fontSize="sm"
									lineHeight="1.6"
								>
									{message.content}
								</Text>
							</Box>

							{/* メタデータ表示（存在する場合） */}
							{message.metadata && Object.keys(message.metadata).length > 0 && (
								<>
									<Divider />
									<Box>
										<Text fontSize="xs" color={mutedColor} mb={2}>
											メタデータ:
										</Text>
										<Box
											bg={useColorModeValue("gray.50", "gray.700")}
											p={3}
											borderRadius="md"
											fontSize="xs"
											fontFamily="mono"
										>
											<pre>{JSON.stringify(message.metadata, null, 2)}</pre>
										</Box>
									</Box>
								</>
							)}
						</VStack>
					</Collapse>
				</VStack>
			</CardBody>
		</MotionCard>
	);
};

export default function HistoryPage() {
	// Color values
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, gray.900, purple.900, pink.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.800", "white");
	const mutedColor = useColorModeValue("gray.600", "gray.400");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const accentColor = useColorModeValue("purple.500", "purple.300");

	// const historyList = useAtomValue(sessionHistoryListAtomLoadable);
	const historyList = useLoadableAtom(sessionHistoryListAtomLoadable);

	// 履歴データの更新
	const refreshHistory = () => {
		// atomWithRefreshを使用してデータを再取得
		window.location.reload(); // 簡易的な更新方法
	};

	return (
		<>
			<Header />
			<Box minH="100vh" bgGradient={bgGradient}>
				<Container maxW="container.xl" py={8}>
					<MotionBox
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<Flex align="center" justify="space-between" mb={8}>
							<HStack spacing={4}>
								<Icon as={FaHistory} boxSize={8} color={accentColor} />
								<Heading size="xl" color={textColor}>
									レシピ生成履歴
								</Heading>
							</HStack>
							<Tooltip label="履歴を更新">
								<IconButton
									aria-label="Refresh history"
									icon={<IoRefresh />}
									onClick={refreshHistory}
									colorScheme="purple"
									variant="ghost"
								/>
							</Tooltip>
						</Flex>
					</MotionBox>
					{/* 履歴コンテンツ */}
					{historyList === undefined && (
						<MotionBox
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							<Flex justify="center" align="center" minH="400px">
								<VStack spacing={4}>
									<Spinner size="xl" color={accentColor} thickness="4px" />
									<Text color={mutedColor} fontSize="lg">
										履歴を読み込み中...
									</Text>
								</VStack>
							</Flex>
						</MotionBox>
					)}
					{historyList === null && (
						<MotionBox
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Alert status="error" borderRadius="lg">
								<AlertIcon />
								<Box>
									<AlertTitle>エラーが発生しました</AlertTitle>
									<AlertDescription>
										履歴の取得に失敗しました。ページを更新するか、しばらく時間をおいて再度お試しください。
									</AlertDescription>
								</Box>
							</Alert>
						</MotionBox>
					)}{" "}
					{historyList && (
						<MotionBox
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							{historyList.length === 0 ? (
								<Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
									<CardBody>
										<VStack spacing={6} py={12}>
											<Icon as={FaHistory} boxSize={16} color={mutedColor} />
											<VStack spacing={2}>
												<Heading size="md" color={textColor}>
													まだ履歴がありません
												</Heading>
												<Text color={mutedColor} textAlign="center">
													レシピ生成を開始すると、ここに履歴が表示されます
												</Text>
											</VStack>
										</VStack>
									</CardBody>
								</Card>
							) : (
								<VStack spacing={6}>
									{historyList.map((historySession, sessionIndex) => (
										<SessionCard
											key={`session-${sessionIndex}`}
											historySession={historySession}
											sessionIndex={sessionIndex}
											cardBg={cardBg}
											borderColor={borderColor}
											textColor={textColor}
											mutedColor={mutedColor}
											accentColor={accentColor}
										/>
									))}
								</VStack>
							)}
						</MotionBox>
					)}
					{historyList && !historyList && (
						<MotionBox
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Alert status="info" borderRadius="lg">
								<AlertIcon />
								<Box>
									<AlertTitle>履歴データなし</AlertTitle>
									<AlertDescription>
										まだレシピ生成の履歴がありません。メインページでレシピ生成を開始してください。
									</AlertDescription>
								</Box>
							</Alert>
						</MotionBox>
					)}
				</Container>
			</Box>
		</>
	);
}
