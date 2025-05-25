import {
	Box,
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Link,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function RegisterForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<{
		email?: string;
		password?: string;
		confirmPassword?: string;
	}>({});
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const toast = useToast();

	const validateForm = () => {
		const newErrors: {
			email?: string;
			password?: string;
			confirmPassword?: string;
		} = {};

		if (!email) newErrors.email = "メールアドレスは必須です";
		if (!password) newErrors.password = "パスワードは必須です";
		if (password.length < 8)
			newErrors.password = "パスワードは8文字以上である必要があります";
		if (password !== confirmPassword)
			newErrors.confirmPassword = "パスワードが一致しません";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);

		try {
			toast({
				title: "登録成功",
				description: "アカウントが作成されました。ログインしてください。",
				status: "success",
				duration: 5000,
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
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box maxW="md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg">
			<Heading mb={6} textAlign="center">
				アカウント登録
			</Heading>
			<form onSubmit={handleSubmit}>
				<Stack spacing={4}>
					<FormControl isInvalid={!!errors.email}>
						<FormLabel>メールアドレス</FormLabel>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<FormErrorMessage>{errors.email}</FormErrorMessage>
					</FormControl>

					<FormControl isInvalid={!!errors.password}>
						<FormLabel>パスワード</FormLabel>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<FormErrorMessage>{errors.password}</FormErrorMessage>
					</FormControl>

					<FormControl isInvalid={!!errors.confirmPassword}>
						<FormLabel>パスワード（確認）</FormLabel>
						<Input
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
						<FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
					</FormControl>

					<Button type="submit" colorScheme="blue" isLoading={isLoading}>
						登録する
					</Button>

					<Text textAlign="center">
						既にアカウントをお持ちの方は{" "}
						<Link color="blue.500" href="/auth/login">
							ログイン
						</Link>
					</Text>
				</Stack>
			</form>
		</Box>
	);
}
