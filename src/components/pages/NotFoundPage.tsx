import {
	Box,
	Button,
	Container,
	Heading,
	Icon,
	Text,
	VStack,
	useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaHome, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router";

import Header from "@/components/organisms/Header";

// Motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function NotFoundPage() {
	const navigate = useNavigate();

	// Color values
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, gray.900, purple.900, pink.900)",
	);
	const textColor = useColorModeValue("gray.800", "white");
	const mutedColor = useColorModeValue("gray.600", "gray.400");
	const cardBg = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	const handleGoHome = () => {
		navigate("/home");
	};

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<Box minH="100vh" bgGradient={bgGradient}>
			<Header />
			<Container maxW="4xl" py={16}>
				<MotionBox
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<VStack spacing={8} textAlign="center">
						{/* 404 Icon and Number */}
						<VStack spacing={4}>
							<MotionBox
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								<Icon
									as={FaSearch}
									boxSize={20}
									color="purple.400"
									opacity={0.6}
								/>
							</MotionBox>
							<Heading
								size="4xl"
								color="purple.500"
								fontWeight="bold"
								letterSpacing="wider"
							>
								404
							</Heading>
						</VStack>

						{/* Error Message */}
						<VStack spacing={4} maxW="md">
							<Heading size="lg" color={textColor}>
								ページが見つかりません
							</Heading>
							<Text color={mutedColor} fontSize="lg" lineHeight="1.6">
								お探しのページは存在しないか、移動または削除された可能性があります。
							</Text>
						</VStack>

						{/* Action Buttons */}
						<VStack spacing={4} pt={4}>
							<MotionButton
								leftIcon={<Icon as={FaHome} />}
								onClick={handleGoHome}
								colorScheme="purple"
								size="lg"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								ホームに戻る
							</MotionButton>
							<MotionButton
								leftIcon={<Icon as={FaArrowLeft} />}
								onClick={handleGoBack}
								variant="outline"
								colorScheme="purple"
								size="lg"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								前のページに戻る
							</MotionButton>
						</VStack>

						{/* Decorative Card */}
						<MotionBox
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							w="full"
							maxW="md"
							mt={8}
						>
							<Box
								bg={cardBg}
								rounded="xl"
								p={6}
								border="1px"
								borderColor={borderColor}
								shadow="lg"
							>
								<VStack spacing={3}>
									<Text fontWeight="semibold" color={textColor} fontSize="sm">
										お困りの場合は以下をお試しください
									</Text>
									<VStack spacing={2} align="start" w="full">
										<Text fontSize="sm" color={mutedColor}>
											• URLが正しく入力されているか確認
										</Text>
										<Text fontSize="sm" color={mutedColor}>
											• ブラウザの戻るボタンを使用
										</Text>
										<Text fontSize="sm" color={mutedColor}>
											• ホームページから再度ナビゲート
										</Text>
									</VStack>
								</VStack>
							</Box>
						</MotionBox>
					</VStack>
				</MotionBox>
			</Container>
		</Box>
	);
}
