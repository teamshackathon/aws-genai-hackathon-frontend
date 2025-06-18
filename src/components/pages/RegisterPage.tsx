import {
	Box,
	Button,
	Center,
	Container,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Heading,
	Icon,
	IconButton,
	Input,
	InputGroup,
	InputRightElement,
	Link,
	Progress,
	Text,
	VStack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaCookie, FaRegStar, FaUserPlus } from "react-icons/fa6";
import { Link as RouterLink, useNavigate } from "react-router";

import GitHubLoginButton from "@/components/atoms/GitHubLoginButton";
import GoogleLoginButton from "@/components/atoms/GoogleLoginButton";
import { createAccountInPasswordAtom } from "@/lib/atom/AuthAtom";
import { useSetAtom } from "jotai";

const MotionBox = motion(Box);
const MotionIcon = motion(Icon);

interface FormData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface FormErrors {
	name?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
}

const FloatingIcon = ({
	icon,
	initialX,
	initialY,
	duration,
}: {
	icon: React.ElementType;
	initialX: number;
	initialY: number;
	duration: number;
}) => (
	<MotionIcon
		as={icon}
		position="absolute"
		color="orange.300"
		opacity={0.6}
		animate={{
			x: [initialX, initialX + 20, initialX],
			y: [initialY, initialY - 30, initialY],
			rotate: [0, 15, -15, 0],
		}}
		transition={{
			duration,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		}}
	/>
);

const getPasswordStrength = (password: string): number => {
	let strength = 0;
	if (password.length >= 8) strength += 25;
	if (/[A-Z]/.test(password)) strength += 25;
	if (/[a-z]/.test(password)) strength += 25;
	if (/[0-9]/.test(password)) strength += 15;
	if (/[^A-Za-z0-9]/.test(password)) strength += 10;
	return Math.min(strength, 100);
};

const getPasswordStrengthColor = (strength: number): string => {
	if (strength < 40) return "red";
	if (strength < 70) return "orange";
	return "green";
};

const getPasswordStrengthText = (strength: number): string => {
	if (strength < 40) return "弱い";
	if (strength < 70) return "普通";
	return "強い";
};

export default function RegisterPage() {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const createUser = useSetAtom(createAccountInPasswordAtom);

	const navigate = useNavigate();
	const toast = useToast();

	const bgGradient = useColorModeValue(
		"linear(to-br, orange.50, pink.50, purple.50)",
		"linear(to-br, gray.900, purple.900, pink.900)",
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.700", "gray.100");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "お名前は必須です";
		}

		if (!formData.email.trim()) {
			newErrors.email = "メールアドレスは必須です";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "有効なメールアドレスを入力してください";
		}

		if (!formData.password) {
			newErrors.password = "パスワードは必須です";
		} else if (formData.password.length < 8) {
			newErrors.password = "パスワードは8文字以上である必要があります";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "パスワード確認は必須です";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "パスワードが一致しません";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setIsLoading(true);

		try {
			await createUser({
				name: formData.name,
				email: formData.email,
				password: formData.password,
			});

			toast({
				title: "アカウント作成成功！",
				description: "ウェルカム！ログインしてサービスをお楽しみください。",
				status: "success",
				duration: 5000,
				isClosable: true,
			});

			navigate("/login");
		} catch (error) {
			console.error("Registration failed:", error);
			toast({
				title: "登録に失敗しました",
				description:
					"このメールアドレスは既に使用されているか、サーバーエラーが発生しました",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const passwordStrength = getPasswordStrength(formData.password);

	return (
		<Box
			minH="100vh"
			bgGradient={bgGradient}
			position="relative"
			overflow="hidden"
		>
			{/* Floating decorative elements */}
			<FloatingIcon
				icon={FaCookie}
				initialX={100}
				initialY={150}
				duration={4}
			/>
			<FloatingIcon
				icon={FaRegStar}
				initialX={200}
				initialY={300}
				duration={5}
			/>
			<FloatingIcon
				icon={FaCookie}
				initialX={300}
				initialY={100}
				duration={6}
			/>
			<FloatingIcon
				icon={FaRegStar}
				initialX={400}
				initialY={250}
				duration={4.5}
			/>
			<FloatingIcon
				icon={FaCookie}
				initialX={500}
				initialY={180}
				duration={5.5}
			/>

			<Container maxW="md" py={12}>
				<Center minH="calc(100vh - 6rem)">
					<MotionBox
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						w="full"
					>
						<Box
							bg={cardBg}
							p={8}
							rounded="2xl"
							shadow="2xl"
							borderWidth="1px"
							borderColor={borderColor}
							backdropFilter="blur(10px)"
						>
							<VStack spacing={6} w="full">
								<MotionBox
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
								>
									<Icon
										as={FaUserPlus}
										boxSize={12}
										color="orange.400"
										mb={2}
									/>
								</MotionBox>

								<VStack spacing={2}>
									<Heading
										size="xl"
										color={textColor}
										textAlign="center"
										fontWeight="bold"
									>
										アカウント作成
									</Heading>
									<Text color="gray.500" textAlign="center">
										美味しい料理の世界へようこそ！
									</Text>
								</VStack>

								<Box w="full">
									<form>
										<VStack spacing={5}>
											<FormControl isInvalid={!!errors.name}>
												<FormLabel color={textColor} fontWeight="medium">
													お名前
												</FormLabel>
												<MotionBox
													whileFocus={{ scale: 1.02 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													<Input
														type="text"
														value={formData.name}
														onChange={(e) =>
															handleInputChange("name", e.target.value)
														}
														placeholder="田中 太郎"
														size="lg"
														borderRadius="xl"
														_focus={{
															borderColor: "orange.400",
															boxShadow: "0 0 0 1px orange.400",
														}}
													/>
												</MotionBox>
												<FormErrorMessage>{errors.name}</FormErrorMessage>
											</FormControl>

											<FormControl isInvalid={!!errors.email}>
												<FormLabel color={textColor} fontWeight="medium">
													メールアドレス
												</FormLabel>
												<MotionBox
													whileFocus={{ scale: 1.02 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													<Input
														type="email"
														value={formData.email}
														onChange={(e) =>
															handleInputChange("email", e.target.value)
														}
														placeholder="example@email.com"
														size="lg"
														borderRadius="xl"
														_focus={{
															borderColor: "orange.400",
															boxShadow: "0 0 0 1px orange.400",
														}}
													/>
												</MotionBox>
												<FormErrorMessage>{errors.email}</FormErrorMessage>
											</FormControl>

											<FormControl isInvalid={!!errors.password}>
												<FormLabel color={textColor} fontWeight="medium">
													パスワード
												</FormLabel>
												<MotionBox
													whileFocus={{ scale: 1.02 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													<InputGroup size="lg">
														<Input
															type={showPassword ? "text" : "password"}
															value={formData.password}
															onChange={(e) =>
																handleInputChange("password", e.target.value)
															}
															placeholder="8文字以上のパスワード"
															borderRadius="xl"
															_focus={{
																borderColor: "orange.400",
																boxShadow: "0 0 0 1px orange.400",
															}}
														/>
														<InputRightElement>
															<IconButton
																aria-label="パスワード表示切替"
																icon={showPassword ? <FaEyeSlash /> : <FaEye />}
																onClick={() => setShowPassword(!showPassword)}
																variant="ghost"
																size="sm"
															/>
														</InputRightElement>
													</InputGroup>
												</MotionBox>
												<FormErrorMessage>{errors.password}</FormErrorMessage>
												{formData.password && (
													<VStack spacing={2} mt={2} align="stretch">
														<HStack justify="space-between">
															<Text fontSize="sm" color="gray.500">
																パスワード強度:
															</Text>
															<Text
																fontSize="sm"
																color={`${getPasswordStrengthColor(passwordStrength)}.500`}
																fontWeight="medium"
															>
																{getPasswordStrengthText(passwordStrength)}
															</Text>
														</HStack>
														<Progress
															value={passwordStrength}
															colorScheme={getPasswordStrengthColor(
																passwordStrength,
															)}
															size="sm"
															borderRadius="full"
														/>
													</VStack>
												)}
											</FormControl>

											<FormControl isInvalid={!!errors.confirmPassword}>
												<FormLabel color={textColor} fontWeight="medium">
													パスワード確認
												</FormLabel>
												<MotionBox
													whileFocus={{ scale: 1.02 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													<InputGroup size="lg">
														<Input
															type={showConfirmPassword ? "text" : "password"}
															value={formData.confirmPassword}
															onChange={(e) =>
																handleInputChange(
																	"confirmPassword",
																	e.target.value,
																)
															}
															placeholder="パスワードを再入力"
															borderRadius="xl"
															_focus={{
																borderColor: "orange.400",
																boxShadow: "0 0 0 1px orange.400",
															}}
														/>
														<InputRightElement>
															<IconButton
																aria-label="パスワード確認表示切替"
																icon={
																	showConfirmPassword ? (
																		<FaEyeSlash />
																	) : (
																		<FaEye />
																	)
																}
																onClick={() =>
																	setShowConfirmPassword(!showConfirmPassword)
																}
																variant="ghost"
																size="sm"
															/>
														</InputRightElement>
													</InputGroup>
												</MotionBox>
												<FormErrorMessage>
													{errors.confirmPassword}
												</FormErrorMessage>
											</FormControl>

											<MotionBox
												w="full"
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<Button
													type="submit"
													size="lg"
													w="full"
													bgGradient="linear(to-r, orange.400, pink.400)"
													color="white"
													_hover={{
														bgGradient: "linear(to-r, orange.500, pink.500)",
														transform: "translateY(-1px)",
														boxShadow: "lg",
													}}
													_active={{
														transform: "translateY(0)",
													}}
													isLoading={isLoading}
													loadingText="アカウント作成中..."
													borderRadius="xl"
													fontWeight="bold"
													onClick={() => handleSubmit()}
												>
													アカウントを作成
												</Button>
											</MotionBox>

											<Box w="full">
												<Text
													textAlign="center"
													mb={4}
													color="gray.500"
													fontSize="sm"
												>
													または
												</Text>
												<GitHubLoginButton />
												<Box mt={4} />
												<GoogleLoginButton />
											</Box>

											<Box textAlign="center" pt={4}>
												<Text color="gray.500" fontSize="sm">
													既にアカウントをお持ちの方は{" "}
													<Link
														as={RouterLink}
														to="/login"
														color="orange.400"
														fontWeight="medium"
														_hover={{
															color: "orange.500",
															textDecoration: "underline",
														}}
													>
														ログイン
													</Link>
												</Text>
											</Box>
										</VStack>
									</form>
								</Box>
							</VStack>
						</Box>
					</MotionBox>
				</Center>
			</Container>
		</Box>
	);
}
