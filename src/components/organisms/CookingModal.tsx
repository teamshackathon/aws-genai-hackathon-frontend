import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Progress,
	Spinner,
	Text,
	VStack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	FaArrowLeft,
	FaArrowRight,
	FaCheck,
	FaClock,
	FaPause,
	FaUtensils,
	FaVolumeUp,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

import { type ChatVoice, generateVoice } from "@/lib/domain/VoiceQuery";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

interface Process {
	id: number;
	recipeId: number;
	stepNumber: number;
	instruction: string;
	estimatedTime?: number;
	createdAt: Date;
	updatedAt: Date;
}

interface CookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	processes: Process[];
	recipeName: string;
}

export default function CookingModal({
	isOpen,
	onClose,
	processes,
	recipeName,
}: CookingModalProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [currentVoice, setCurrentVoice] = useState<ChatVoice | null>(null);
	const [isVoiceLoading, setIsVoiceLoading] = useState(false);
	const [isVoicePlaying, setIsVoicePlaying] = useState(false);
	const toast = useToast();

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

	const totalSteps = processes.length;
	const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
	const currentProcess = processes[currentStep];

	const handleNext = () => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
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

	// 音声生成・再生のハンドラー
	const handleVoicePlay = async () => {
		const currentProcess = processes[currentStep];
		if (!currentProcess) return;

		try {
			setIsVoiceLoading(true);

			// 既存の音声を停止
			if (currentVoice) {
				currentVoice.stop();
			}

			const voice = await generateVoice(
				"cooking-assistant",
				currentProcess.instruction,
			);
			setCurrentVoice(voice);

			setIsVoicePlaying(true);
			await voice.play();
			setIsVoicePlaying(false);
		} catch (error) {
			console.error("音声生成・再生エラー:", error);
			toast({
				title: "音声の生成に失敗しました",
				description: "もう一度お試しください",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
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

	// ステップ変更時に音声を停止
	useEffect(() => {
		if (currentVoice) {
			currentVoice.stop();
			setIsVoicePlaying(false);
		}
	}, [currentStep]);

	// モーダルクローズ時に音声を停止
	useEffect(() => {
		if (!isOpen && currentVoice) {
			currentVoice.stop();
			setIsVoicePlaying(false);
		}
	}, [isOpen, currentVoice]);

	if (!currentProcess) {
		return null;
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="full"
			motionPreset="slideInBottom"
		>
			<ModalOverlay bg="blackAlpha.800" />
			<ModalContent
				bg={bgGradient}
				m={0}
				borderRadius={0}
				minH="100vh"
				position="relative"
			>
				<ModalCloseButton
					size="lg"
					color={textColor}
					bg={cardBg}
					rounded="full"
					top={4}
					right={4}
					zIndex={10}
					_hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
				/>

				<ModalHeader p={0}>
					<Box
						bg={cardBg}
						borderBottom="1px"
						borderColor={borderColor}
						px={6}
						py={4}
					>
						<HStack spacing={4}>
							<Icon as={FaUtensils} color={primaryColor} boxSize={6} />
							<VStack align="start" spacing={0}>
								<Text fontSize="lg" fontWeight="bold" color={textColor}>
									{recipeName}
								</Text>
								<Text fontSize="sm" color={mutedColor}>
									料理工程ガイド
								</Text>
							</VStack>
						</HStack>
					</Box>
				</ModalHeader>

				<ModalBody p={0} position="relative">
					{/* Progress section */}
					<Box
						bg={cardBg}
						borderBottom="1px"
						borderColor={borderColor}
						px={6}
						py={4}
					>
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
								{processes.map((_, index) => (
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
					</Box>
					{/* Main content area */}
					<Flex
						direction="column"
						h="calc(100vh - 200px)"
						justify="center"
						p={6}
					>
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
												<Icon
													as={HiSparkles}
													color={primaryColor}
													boxSize={6}
												/>
												<Heading size="lg" color={textColor}>
													ステップ {currentProcess.stepNumber}
												</Heading>
											</HStack>
											{currentProcess.estimatedTime && (
												<HStack spacing={2}>
													<Icon as={FaClock} color={mutedColor} boxSize={4} />
													<Text fontSize="sm" color={mutedColor}>
														目安時間: {currentProcess.estimatedTime}分
													</Text>
												</HStack>
											)}
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
												{currentProcess.instruction}
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
										</HStack>
									</VStack>
								</CardBody>
							</MotionCard>
						</AnimatePresence>
					</Flex>{" "}
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
						<HStack justify="space-between" maxW="800px" mx="auto">
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
									onClick={onClose}
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
					</Box>{" "}
					{/* Tap areas for mobile navigation */}
					<Box
						position="absolute"
						top="200px"
						left={0}
						bottom="80px"
						w="30%"
						onClick={handlePrevious}
						cursor={currentStep > 0 ? "pointer" : "not-allowed"}
						opacity={0}
						bg="transparent"
						_hover={{ bg: "blackAlpha.100" }}
						transition="background 0.2s"
					/>
					<Box
						position="absolute"
						top="200px"
						right={0}
						bottom="80px"
						w="30%"
						onClick={currentStep === totalSteps - 1 ? onClose : handleNext}
						cursor="pointer"
						opacity={0}
						bg="transparent"
						_hover={{ bg: "blackAlpha.100" }}
						transition="background 0.2s"
					/>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
