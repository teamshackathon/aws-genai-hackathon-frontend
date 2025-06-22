import {
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Container,
	Divider,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Heading,
	Icon,
	IconButton,
	Image,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	Link,
	Text,
	VStack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { useState } from "react";
import {
	FaEnvelope,
	FaEye,
	FaEyeSlash,
	FaGithub,
	FaGoogle,
	FaLock,
	FaSignInAlt,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router";

import {
	loginInGithubAtom,
	loginInGoogleAtom,
	loginInPasswordAtom,
} from "@/lib/atom/AuthAtom";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function LoginPage() {
	const toast = useToast();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<{ email?: string; password?: string }>(
		{},
	);
	const [isLoading, setIsLoading] = useState(false);

	const login = useSetAtom(loginInPasswordAtom);
	const setLoginInGithub = useSetAtom(loginInGithubAtom);
	const setGoogleInGoogle = useSetAtom(loginInGoogleAtom);

	// Color values
	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, gray.900, purple.900, pink.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.800", "white");
	const mutedColor = useColorModeValue("gray.600", "gray.400");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const inputBg = useColorModeValue("gray.50", "gray.700");

	const validateForm = () => {
		const newErrors: { email?: string; password?: string } = {};
		if (!email) newErrors.email = "メールアドレスは必須です";
		if (!password) newErrors.password = "パスワードは必須です";
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "有効なメールアドレスを入力してください";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);

		try {
			const returnUrl = sessionStorage.getItem("returnUrl") || "/home";
			sessionStorage.removeItem("returnUrl");

			await login({ username: email, password });

			toast({
				title: "ログインしました",
				description: "ようこそ！レシピの世界へ",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			navigate(returnUrl);
		} catch (error) {
			console.error("Login failed:", error);
			toast({
				title: "ログインに失敗しました",
				description: "メールアドレスまたはパスワードが正しくありません",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleGitHubLogin = () => {
		setLoginInGithub();
		toast({
			title: "GitHubでログイン中...",
			description: "リダイレクトしています",
			status: "info",
			duration: 2000,
			isClosable: true,
		});
	};

	return (
		<Box
			minH="100vh"
			bgGradient={bgGradient}
			position="relative"
			overflow="hidden"
		>
			{/* Background decorative elements */}
			<MotionBox
				position="absolute"
				top="10%"
				right="10%"
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 0.1, scale: 1 }}
				transition={{ duration: 2, delay: 0.5 }}
			>
				<Image
					src="/favicon.svg"
					alt="BAE Recipe Logo"
					boxSize={32}
					opacity={0.6}
				/>
			</MotionBox>
			<MotionBox
				position="absolute"
				bottom="15%"
				left="5%"
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 0.1, scale: 1 }}
				transition={{ duration: 2, delay: 1 }}
			>
				<Icon as={HiSparkles} boxSize={24} color="pink.400" />
			</MotionBox>

			<Container maxW="md" py={20}>
				<VStack spacing={8} align="stretch">
					{/* Header */}
					<MotionBox
						initial={{ opacity: 0, y: -50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						textAlign="center"
					>
						<VStack spacing={4}>
							<HStack spacing={3} justify="center">
								<Image src="/favicon.svg" alt="BAE Recipe Logo" boxSize={10} />
								<Box
									onClick={() => navigate("/home")}
									as="img"
									src="/bae-recipe-logo_orange.png"
									alt="BAE RECIPE Logo"
									height={{ base: "32px", md: "40px" }}
									width="auto"
								/>
								<Icon as={HiSparkles} boxSize={6} color="yellow.400" />
							</HStack>
							<Text color={mutedColor} fontSize="lg">
								美味しいレシピの世界へようこそ
							</Text>
						</VStack>
					</MotionBox>

					{/* Login Card */}
					<MotionCard
						bg={cardBg}
						shadow="2xl"
						borderRadius="2xl"
						overflow="hidden"
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						whileHover={{ y: -5 }}
					>
						<CardHeader pb={3}>
							<VStack spacing={2}>
								<Icon as={FaSignInAlt} boxSize={8} color="orange.400" />
								<Heading size="lg" color={textColor}>
									ログイン
								</Heading>
								<Text color={mutedColor} fontSize="sm">
									アカウントにサインインしてください
								</Text>
							</VStack>
						</CardHeader>
						<CardBody pt={0}>
							<form onSubmit={handleSubmit}>
								<VStack spacing={6}>
									<FormControl isInvalid={!!errors.email}>
										<FormLabel color={mutedColor} fontSize="sm">
											メールアドレス
										</FormLabel>
										<InputGroup>
											<InputLeftElement>
												<Icon as={FaEnvelope} color={mutedColor} />
											</InputLeftElement>
											<Input
												type="email"
												value={email}
												onChange={(e) => {
													setEmail(e.target.value);
													if (errors.email)
														setErrors({ ...errors, email: undefined });
												}}
												placeholder="your-email@example.com"
												bg={inputBg}
												border="1px"
												borderColor={borderColor}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
													bg: cardBg,
												}}
												_hover={{
													borderColor: "orange.300",
												}}
											/>
										</InputGroup>
										<FormErrorMessage>{errors.email}</FormErrorMessage>
									</FormControl>

									<FormControl isInvalid={!!errors.password}>
										<FormLabel color={mutedColor} fontSize="sm">
											パスワード
										</FormLabel>
										<InputGroup>
											<InputLeftElement>
												<Icon as={FaLock} color={mutedColor} />
											</InputLeftElement>
											<Input
												type={showPassword ? "text" : "password"}
												value={password}
												onChange={(e) => {
													setPassword(e.target.value);
													if (errors.password)
														setErrors({ ...errors, password: undefined });
												}}
												placeholder="パスワードを入力してください"
												bg={inputBg}
												border="1px"
												borderColor={borderColor}
												_focus={{
													borderColor: "orange.400",
													boxShadow: "0 0 0 1px orange.400",
													bg: cardBg,
												}}
												_hover={{
													borderColor: "orange.300",
												}}
											/>
											<InputRightElement>
												<IconButton
													aria-label={
														showPassword
															? "パスワードを隠す"
															: "パスワードを表示"
													}
													icon={<Icon as={showPassword ? FaEyeSlash : FaEye} />}
													variant="ghost"
													size="sm"
													color={mutedColor}
													onClick={() => setShowPassword(!showPassword)}
													_hover={{ color: "orange.400" }}
												/>
											</InputRightElement>
										</InputGroup>
										<FormErrorMessage>{errors.password}</FormErrorMessage>
									</FormControl>

									<MotionButton
										type="submit"
										colorScheme="orange"
										size="lg"
										w="full"
										leftIcon={<FaSignInAlt />}
										isLoading={isLoading}
										loadingText="ログイン中..."
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										ログイン
									</MotionButton>

									<HStack w="full" align="center">
										<Divider orientation="horizontal" />
										<Text
											color={mutedColor}
											fontSize="sm"
											px={3}
											sx={{
												writingMode: "horizontal-tb",
												textOrientation: "mixed",
												display: "inline-block",
												whiteSpace: "nowrap",
											}}
										>
											または
										</Text>
										<Divider orientation="horizontal" />
									</HStack>

									<MotionButton
										leftIcon={<FaGithub />}
										colorScheme="gray"
										variant="outline"
										size="lg"
										w="full"
										onClick={handleGitHubLogin}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										GitHubでログイン
									</MotionButton>

									<MotionButton
										leftIcon={<Icon as={FaGoogle} />}
										colorScheme="red"
										variant="outline"
										size="lg"
										w="full"
										onClick={() => setGoogleInGoogle()}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										Googleでログイン
									</MotionButton>

									<Divider />

									<HStack justify="center" spacing={1}>
										<Text color={mutedColor} fontSize="sm">
											アカウントをお持ちでないですか？
										</Text>
										<Link
											color="orange.400"
											fontSize="sm"
											fontWeight="medium"
											_hover={{ textDecoration: "underline" }}
											onClick={() => navigate("/auth/register")}
										>
											新規登録
										</Link>
									</HStack>
								</VStack>
							</form>
						</CardBody>
					</MotionCard>

					{/* Footer */}
					<MotionBox
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.8 }}
						textAlign="center"
					>
						<Text color={mutedColor} fontSize="xs">
							© 2025 BAE Recipe. すべての権利を保有します。
						</Text>
					</MotionBox>
				</VStack>
			</Container>
		</Box>
	);
}
