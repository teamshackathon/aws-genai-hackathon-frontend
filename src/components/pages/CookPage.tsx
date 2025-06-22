import {
	Badge,
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
	Progress,
	Spinner,
	Switch,
	Text,
	VStack,
	useBreakpointValue,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	FaArrowLeft,
	FaArrowRight,
	FaCheck,
	FaMicrophone,
	FaMicrophoneSlash,
	FaPause,
	FaUtensils,
	FaVolumeOff,
	FaVolumeUp,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router";

import Header from "@/components/organisms/Header";
import { postCookHistoryAtom } from "@/lib/atom/CookAtom";
import {
	currentRecipeAtom,
	getProcessesAtom,
	getRecipeByIdAtom,
	processesAtom,
} from "@/lib/atom/RecipeAtom";
import { type ChatVoice, generateVoice } from "@/lib/domain/VoiceQuery";
import { useCookWebSocket } from "@/lib/hook/useCookWebSocket";
import { useVoiceRecorder } from "@/lib/hook/useVoiceRecorder";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

function webSocketStatus(status: string) {
	switch (status) {
		case "Connecting":
			return {
				icon: <Icon as={FaMicrophone} boxSize={4} color="orange.500" />,
				text: "接続中...",
				color: "orange.500",
			};
		case "Open":
			return {
				icon: <Icon as={FaMicrophone} boxSize={4} color="green.500" />,
				text: "オンライン",
				color: "green.500",
			};
		case "Closing":
			return {
				icon: <Icon as={FaMicrophone} boxSize={4} color="red.500" />,
				text: "切断中...",
				color: "red.500",
			};
		case "Closed":
			return {
				icon: <Icon as={FaMicrophone} boxSize={4} color="gray.500" />,
				text: "オフライン",
				color: "gray.500",
			};
		default:
			return {
				icon: <Icon as={FaMicrophone} boxSize={4} color="gray.500" />,
				text: "不明",
				color: "gray.500",
			};
	}
}

export default function CookPage() {
	const { recipeId } = useParams<{ recipeId: string }>();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(0);
	const [currentVoice, setCurrentVoice] = useState<ChatVoice | null>(null);
	const [isVoiceLoading, setIsVoiceLoading] = useState(false);
	const [isVoicePlaying, setIsVoicePlaying] = useState(false);
	const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
	const [autoPlayTimeout, setAutoPlayTimeout] = useState<number | null>(null);
	const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
	const toast = useToast();
	const isMobile = useBreakpointValue({ base: true, md: false });

	// Refs for cleanup
	const currentVoiceRef = useRef<ChatVoice | null>(null);
	const autoPlayTimeoutRef = useRef<number | null>(null);

	// Update refs when state changes
	useEffect(() => {
		currentVoiceRef.current = currentVoice;
	}, [currentVoice]);

	useEffect(() => {
		autoPlayTimeoutRef.current = autoPlayTimeout;
	}, [autoPlayTimeout]);

	// Atoms
	const [, getProcesses] = useAtom(getProcessesAtom);
	const [, getCurrentRecipe] = useAtom(getRecipeByIdAtom);
	const processes = useAtomValue(processesAtom);
	const currentRecipe = useAtomValue(currentRecipeAtom);
	const postCookHistory = useSetAtom(postCookHistoryAtom);

	// Color values
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, gray.900, purple.900, pink.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.800", "white");
	const mutedColor = useColorModeValue("gray.600", "gray.400");
	const primaryColor = useColorModeValue("purple.500", "purple.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	// Load data on mount
	useEffect(() => {
		if (recipeId) {
			getCurrentRecipe(Number(recipeId));
			getProcesses(Number(recipeId));
		}
	}, [recipeId, getCurrentRecipe, getProcesses]);

	// Sort processes by process number
	const sortedProcesses = processes.sort(
		(a, b) => a.processNumber - b.processNumber,
	);
	const totalSteps = sortedProcesses.length;
	const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
	const currentProcess = sortedProcesses[currentStep];

	// ここからWebsocket通信の設定
	const shouldConnect = true; // WebSocket接続を有効化

	const { connectionStatus, disconnect, sendMessage } = useCookWebSocket({
		onMessage: (message) => {
			handleWebSocketMessage(message.data);
		},
		shouldConnect: shouldConnect,
	});

	// 音声録音機能
	const voiceRecorder = useVoiceRecorder({
		onDataAvailable: (audioData) => {
			// 音声データをWebSocketで送信
			if (connectionStatus === "Open" && sendMessage) {
				try {
					// バイナリデータとして直接送信
					sendMessage(audioData);
					console.log(
						"音声データ送信:",
						audioData.byteLength,
						"bytes (PCM 16bit 16kHz Mono)",
					);
				} catch (error) {
					console.error("音声データ送信エラー:", error);
				}
			}
		},
		silenceThreshold: 30, // 音声検出の閾値
		silenceTimeout: 1000, // 1秒間無音で録音停止
		minRecordingTime: 500, // 最小録音時間500ms
	});

	const statusInfo = webSocketStatus(connectionStatus);

	const handleNext = () => {
		console.log("現在の番号:", currentStep, "次へ移動試行");
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		console.log("現在の番号:", currentStep, "前へ移動試行");
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleStepJump = (stepIndex: number) => {
		setCurrentStep(stepIndex);
		// 音声を停止
		if (currentVoice) {
			currentVoice.stop();
			setIsVoicePlaying(false);
		}
	};

	const handleComplete = () => {
		// 音声録音を停止
		if (voiceRecorder.isListening) {
			voiceRecorder.stopListening();
		}

		// 音声を停止
		if (currentVoice) {
			currentVoice.stop();
			setCurrentVoice(null);
			setIsVoicePlaying(false);
		}
		// タイマーをクリア
		if (autoPlayTimeout) {
			clearTimeout(autoPlayTimeout);
			setAutoPlayTimeout(null);
		}

		toast({
			title: "お疲れ様でした！",
			description: "料理が完成しました。美味しくお召し上がりください！",
			status: "success",
			duration: 3000,
			isClosable: true,
		});

		// クック履歴を保存
		postCookHistory(Number(recipeId));

		// WebSocket接続を切断
		disconnect();

		// レシピページに戻る
		navigate(`/home/recipe/${recipeId}`);
	};

	const handleBackToRecipe = () => {
		// 音声録音を停止
		if (voiceRecorder.isListening) {
			voiceRecorder.stopListening();
		}

		// 音声を停止
		if (currentVoice) {
			currentVoice.stop();
			setCurrentVoice(null);
			setIsVoicePlaying(false);
		}
		// タイマーをクリア
		if (autoPlayTimeout) {
			clearTimeout(autoPlayTimeout);
			setAutoPlayTimeout(null);
		}

		navigate(`/home/recipe/${recipeId}`);
	};
	// 自動音声再生機能
	const autoPlayVoice = useCallback(
		async (instruction: string) => {
			if (!autoPlayEnabled) return;

			try {
				setIsVoiceLoading(true);

				// 既存の音声を停止
				if (currentVoice) {
					currentVoice.stop();
					setIsVoicePlaying(false);
				}

				const voice = await generateVoice("cooking-assistant", instruction);
				setCurrentVoice(voice);

				setIsVoicePlaying(true);
				await voice.play();
				setIsVoicePlaying(false);
			} catch (error) {
				// AbortErrorは正常な中断として扱う
				if (error instanceof Error && error.name === "AbortError") {
					console.log("音声再生が中断されました（正常）");
					setIsVoicePlaying(false);
				} else {
					console.error("自動音声再生エラー:", error);
				}
			} finally {
				setIsVoiceLoading(false);
			}
		},
		[autoPlayEnabled], // currentVoiceを依存配列から除外
	);

	// 音声生成・再生のハンドラー
	const handleVoicePlay = async () => {
		if (!currentProcess) return;

		try {
			setIsVoiceLoading(true);

			// 既存の音声を停止
			if (currentVoice) {
				currentVoice.stop();
				setIsVoicePlaying(false);
			}

			const voice = await generateVoice(
				"cooking-assistant",
				currentProcess.process,
			);
			setCurrentVoice(voice);

			setIsVoicePlaying(true);
			await voice.play();
			setIsVoicePlaying(false);
		} catch (error) {
			// AbortErrorは正常な中断として扱う
			if (error instanceof Error && error.name === "AbortError") {
				console.log("音声再生が中断されました（正常）");
				setIsVoicePlaying(false);
			} else {
				console.error("音声生成・再生エラー:", error);
				toast({
					title: "音声の生成に失敗しました",
					description: "もう一度お試しください",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} finally {
			setIsVoiceLoading(false);
		}
	};

	const handleVoiceStop = () => {
		if (currentVoice) {
			currentVoice.stop();
			setIsVoicePlaying(false);
		}
	};

	// WebSocketメッセージ処理関数
	const handleWebSocketMessage = useCallback(
		(data: string) => {
			try {
				const message = JSON.parse(data);
				console.log("WebSocketメッセージ受信:", message);

				// JSONスキーマに基づく処理
				if (message && typeof message === "object" && "status" in message) {
					const { status } = message;

					switch (status) {
						case "next":
							console.log("音声コマンド: 次のステップへ");
							setLastVoiceCommand("次のステップ");
							// currentStepを直接更新
							setCurrentStep((prev) => {
								console.log(
									"現在の番号:",
									prev,
									"→",
									Math.min(prev + 1, totalSteps - 1),
								);
								return prev < totalSteps - 1 ? prev + 1 : prev;
							});
							toast({
								title: "🎤 音声コマンド実行",
								description: "次のステップに進みます",
								status: "info",
								duration: 2000,
								isClosable: true,
							});
							break;

						case "previous":
							console.log("音声コマンド: 前のステップへ");
							setLastVoiceCommand("前のステップ");
							// currentStepを直接更新
							setCurrentStep((prev) => {
								console.log("現在の番号:", prev, "→", Math.max(prev - 1, 0));
								return prev > 0 ? prev - 1 : prev;
							});
							toast({
								title: "🎤 音声コマンド実行",
								description: "前のステップに戻ります",
								status: "info",
								duration: 2000,
								isClosable: true,
							});
							break;

						case "play":
							console.log("音声コマンド: 音声再生");
							setLastVoiceCommand("音声再生");
							handleVoicePlay();
							toast({
								title: "🎤 音声コマンド実行",
								description: "手順を音声で再生します",
								status: "info",
								duration: 2000,
								isClosable: true,
							});
							break;

						case "None":
							console.log("音声コマンド: アクションなし");
							setLastVoiceCommand("認識できませんでした");
							break;

						default:
							console.warn("未知のステータス:", status);
							break;
					}
				} else {
					console.warn("不正なメッセージ形式:", message);
				}
			} catch (error) {
				console.error("WebSocketメッセージ分析エラー:", error);
			}

			// 3秒後にコマンド表示をクリア
			setTimeout(() => {
				setLastVoiceCommand(null);
			}, 3000);
		},
		[totalSteps, handleVoicePlay, toast],
	);
	// ステップ変更時に音声を停止し、自動再生をセットアップ
	useEffect(() => {
		let isCancelled = false;

		// 既存の音声とタイマーを停止・クリア
		if (currentVoice) {
			currentVoice.stop();
			setIsVoicePlaying(false);
		}
		if (autoPlayTimeout) {
			clearTimeout(autoPlayTimeout);
			setAutoPlayTimeout(null);
		}

		// 新しいステップで自動再生をセットアップ（2秒後に再生）
		if (autoPlayEnabled && sortedProcesses[currentStep] && !isCancelled) {
			const timeout = window.setTimeout(() => {
				// タイムアウト実行時にキャンセルされていないかチェック
				if (!isCancelled) {
					autoPlayVoice(sortedProcesses[currentStep].process);
				}
			}, 2000); // 2秒の遅延で自動再生
			setAutoPlayTimeout(timeout);
		}

		// クリーンアップ関数
		return () => {
			isCancelled = true;
			if (autoPlayTimeout) {
				clearTimeout(autoPlayTimeout);
			}
		};
	}, [currentStep, autoPlayEnabled, sortedProcesses, autoPlayVoice]); // currentVoice, autoPlayTimeoutを依存配列から除外	// コンポーネント終了時のクリーンアップ
	useEffect(() => {
		return () => {
			if (currentVoiceRef.current) {
				currentVoiceRef.current.stop();
			}
			if (autoPlayTimeoutRef.current) {
				clearTimeout(autoPlayTimeoutRef.current);
			}
		};
	}, []); // 空の依存配列でマウント時のみ実行

	// Loading state
	if (!currentRecipe || sortedProcesses.length === 0) {
		return (
			<Box minH="100vh" bgGradient={bgGradient}>
				<Header />
				<Container maxW="4xl" py={8}>
					<VStack spacing={8}>
						<Spinner size="xl" color="purple.500" />
						<Text color={textColor}>料理手順を読み込み中...</Text>
					</VStack>
				</Container>
			</Box>
		);
	}

	if (!currentProcess) {
		return (
			<Box minH="100vh" bgGradient={bgGradient}>
				<Header />
				<Container maxW="4xl" py={8}>
					<VStack spacing={8}>
						<Text color={textColor}>料理手順が見つかりませんでした</Text>
						<Button onClick={handleBackToRecipe}>レシピに戻る</Button>
					</VStack>
				</Container>
			</Box>
		);
	}

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			<Header />

			{/* Header section */}
			<Box
				bg={cardBg}
				borderBottom="1px"
				borderColor={borderColor}
				px={6}
				py={4}
			>
				<Container maxW="4xl">
					{isMobile ? (
						<Box>
							<Button
								leftIcon={<FaArrowLeft />}
								onClick={handleBackToRecipe}
								variant="ghost"
								colorScheme="purple"
							>
								レシピに戻る
							</Button>
							<HStack spacing={4} justify="space-between" mt={2}>
								<Icon as={FaUtensils} color={primaryColor} boxSize={6} />
								<Text fontSize="lg" fontWeight="bold" color={textColor}>
									{currentRecipe.recipeName}
								</Text>
								{statusInfo.icon}
							</HStack>
							<HStack spacing={2} mt={5}>
								<Icon
									as={autoPlayEnabled ? FaVolumeUp : FaVolumeOff}
									color={autoPlayEnabled ? primaryColor : mutedColor}
									boxSize={6}
								/>
								<Switch
									isChecked={autoPlayEnabled}
									onChange={(e) => setAutoPlayEnabled(e.target.checked)}
									colorScheme="purple"
									size="md"
								/>
								<Text fontSize="xl" color={mutedColor}>
									自動音声
								</Text>
							</HStack>
						</Box>
					) : (
						<HStack spacing={4} justify="space-between">
							<HStack spacing={4}>
								<Icon as={FaUtensils} color={primaryColor} boxSize={6} />
								<VStack align="start" spacing={0}>
									<Text fontSize="lg" fontWeight="bold" color={textColor}>
										{currentRecipe.recipeName}
									</Text>
									<Text fontSize="sm" color={mutedColor}>
										料理工程ガイド
									</Text>
								</VStack>
							</HStack>{" "}
							{/* WebSocket status */}
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
							{/* 最後の音声コマンド表示 */}
							{lastVoiceCommand && (
								<HStack spacing={2} bg="blue.50" px={3} py={1} rounded="md">
									<Text fontSize="xs" color="blue.600" fontWeight="bold">
										🎤 {lastVoiceCommand}
									</Text>
								</HStack>
							)}
							{/* 自動再生コントロール */}
							<HStack spacing={2}>
								<Icon
									as={autoPlayEnabled ? FaVolumeUp : FaVolumeOff}
									color={autoPlayEnabled ? primaryColor : mutedColor}
									boxSize={4}
								/>
								<Switch
									isChecked={autoPlayEnabled}
									onChange={(e) => setAutoPlayEnabled(e.target.checked)}
									colorScheme="purple"
									size="sm"
								/>
								<Text fontSize="xs" color={mutedColor}>
									自動音声
								</Text>
							</HStack>
							{/* Back button */}
							<Button
								leftIcon={<FaArrowLeft />}
								onClick={handleBackToRecipe}
								variant="ghost"
								colorScheme="purple"
							>
								レシピに戻る
							</Button>
						</HStack>
					)}
				</Container>
			</Box>

			{/* Progress section */}
			<Box
				bg={cardBg}
				borderBottom="1px"
				borderColor={borderColor}
				px={6}
				pt={4}
			>
				<Container maxW="4xl">
					<VStack spacing={3}>
						<HStack justify="space-between" w="100%">
							<Text fontSize="sm" color={mutedColor}>
								ステップ {currentStep + 1} / {totalSteps}
							</Text>
							<Badge colorScheme="purple" variant="subtle">
								{Math.round(progress)}% 完了
							</Badge>
						</HStack>
						<Progress
							value={progress}
							colorScheme="purple"
							w="100%"
							rounded="full"
							h={2}
						/>
						{/* Step navigation dots */}
						<HStack spacing={2} overflowX="auto" maxW="100%" py={2}>
							{sortedProcesses.map((_, index) => (
								<IconButton
									key={index}
									aria-label={`ステップ ${index + 1}`}
									size="sm"
									variant={index === currentStep ? "solid" : "outline"}
									colorScheme="purple"
									icon={<Text fontSize="xs">{index + 1}</Text>}
									onClick={() => handleStepJump(index)}
									minW="32px"
								/>
							))}
						</HStack>
					</VStack>
				</Container>
			</Box>

			{/* Main content area */}
			<Container maxW="4xl" py={4}>
				<Flex direction="column" justify="center">
					<AnimatePresence mode="wait">
						<MotionCard
							key={currentStep}
							bg={cardBg}
							borderColor={borderColor}
							borderWidth={1}
							maxW="800px"
							mx="auto"
							w="100%"
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							transition={{ duration: 0.3 }}
						>
							<CardBody p={8}>
								<VStack spacing={6} textAlign="center">
									{/* Step header */}
									<VStack spacing={2}>
										<HStack spacing={3}>
											<Icon as={HiSparkles} color={primaryColor} boxSize={6} />
											<Heading size="lg" color={textColor}>
												ステップ {currentProcess.processNumber}
											</Heading>
										</HStack>
									</VStack>

									{/* Step instruction */}
									<MotionBox
										initial={{ scale: 0.95 }}
										animate={{ scale: 1 }}
										transition={{ duration: 0.2, delay: 0.1 }}
									>
										<Text
											fontSize="xl"
											lineHeight="1.8"
											color={textColor}
											whiteSpace="pre-wrap"
											textAlign="left"
											bg={useColorModeValue("gray.50", "gray.700")}
											p={6}
											rounded="xl"
											border="2px"
											borderColor={borderColor}
										>
											{currentProcess.process}
										</Text>
									</MotionBox>
									{/* Voice control buttons */}
									<HStack spacing={4}>
										<Button
											leftIcon={
												isVoiceLoading ? (
													<Spinner size="sm" />
												) : isVoicePlaying ? (
													<Icon as={FaPause} />
												) : (
													<Icon as={FaVolumeUp} />
												)
											}
											onClick={
												isVoicePlaying ? handleVoiceStop : handleVoicePlay
											}
											colorScheme="blue"
											variant="outline"
											isLoading={isVoiceLoading}
											loadingText="生成中"
											size="lg"
										>
											{isVoicePlaying ? "停止" : "音声で聞く"}
										</Button>

										{/* 音声録音ボタン */}
										<Button
											leftIcon={
												<Icon
													as={
														voiceRecorder.isListening
															? FaMicrophone
															: FaMicrophoneSlash
													}
													color={
														voiceRecorder.isListening ? "red.500" : "gray.500"
													}
												/>
											}
											onClick={
												voiceRecorder.isListening
													? voiceRecorder.stopListening
													: voiceRecorder.startListening
											}
											colorScheme={voiceRecorder.isListening ? "red" : "gray"}
											variant={voiceRecorder.isListening ? "solid" : "outline"}
											size="lg"
											isDisabled={connectionStatus !== "Open"}
										>
											{voiceRecorder.isListening ? "音声停止" : "音声開始"}
										</Button>
									</HStack>

									{/* 音声レベル表示 */}
									{voiceRecorder.isListening && (
										<VStack spacing={2}>
											<Text fontSize="sm" color={mutedColor}>
												音量レベル: {Math.round(voiceRecorder.volume)}
											</Text>
											<Progress
												value={(voiceRecorder.volume / 100) * 100}
												colorScheme={voiceRecorder.isRecording ? "red" : "gray"}
												size="sm"
												w="200px"
											/>
											{voiceRecorder.isRecording && (
												<Text fontSize="xs" color="red.500" fontWeight="bold">
													🔴 録音中
												</Text>
											)}
										</VStack>
									)}

									{/* エラー表示 */}
									{voiceRecorder.error && (
										<Text fontSize="sm" color="red.500">
											エラー: {voiceRecorder.error}
										</Text>
									)}
								</VStack>
							</CardBody>
						</MotionCard>
					</AnimatePresence>
				</Flex>
			</Container>

			{/* Navigation buttons */}
			<Box
				position="fixed"
				bottom={0}
				left={0}
				right={0}
				bg={cardBg}
				borderTop="1px"
				borderColor={borderColor}
				p={4}
			>
				{isMobile ? (
					<Box>
						<HStack justify="space-between">
							<IconButton
								aria-label="前のステップ"
								icon={<FaArrowLeft />}
								onClick={handlePrevious}
								isDisabled={currentStep === 0}
								variant="ghost"
								colorScheme="purple"
								size="lg"
							/>
							<VStack spacing={1}>
								<Text fontSize="sm" color={mutedColor}>
									{currentStep === totalSteps - 1
										? "料理完了"
										: "タップして次へ"}
								</Text>
								<Text fontSize="xs" color={mutedColor}>
									{currentStep + 1} / {totalSteps}
								</Text>
							</VStack>
							{currentStep === totalSteps - 1 ? (
								<IconButton
									aria-label="完了・終了"
									icon={<FaCheck />}
									onClick={handleComplete}
									colorScheme="green"
									size="lg"
								/>
							) : (
								<IconButton
									aria-label="次のステップ"
									icon={<FaArrowRight />}
									onClick={handleNext}
									colorScheme="purple"
									size="lg"
								/>
							)}
						</HStack>
					</Box>
				) : (
					<Container maxW="4xl">
						<HStack justify="space-between">
							<Button
								leftIcon={<FaArrowLeft />}
								onClick={handlePrevious}
								isDisabled={currentStep === 0}
								variant="ghost"
								colorScheme="purple"
								size="lg"
							>
								前のステップ
							</Button>

							<VStack spacing={1}>
								<Text fontSize="sm" color={mutedColor}>
									{currentStep === totalSteps - 1
										? "料理完了"
										: "タップして次へ"}
								</Text>
								<Text fontSize="xs" color={mutedColor}>
									{currentStep + 1} / {totalSteps}
								</Text>
							</VStack>

							{currentStep === totalSteps - 1 ? (
								<Button
									rightIcon={<FaCheck />}
									onClick={handleComplete}
									colorScheme="green"
									size="lg"
								>
									完了・終了
								</Button>
							) : (
								<Button
									rightIcon={<FaArrowRight />}
									onClick={handleNext}
									colorScheme="purple"
									size="lg"
								>
									次のステップ
								</Button>
							)}
						</HStack>
					</Container>
				)}
			</Box>
		</Box>
	);
}
