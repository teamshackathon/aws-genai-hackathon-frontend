"use client";

import { isLoadingAuthAtom, loginInPasswordAtom } from "@/lib/atom/AuthAtom";
import {
	Box,
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Stack,
} from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<{ email?: string; password?: string }>(
		{},
	);

	const login = useSetAtom(loginInPasswordAtom);
	const setIsLoading = useSetAtom(isLoadingAuthAtom);

	const navigate = useNavigate();

	const validateForm = () => {
		const newErrors: { email?: string; password?: string } = {};
		if (!email) newErrors.email = "メールアドレスは必須です";
		if (!password) newErrors.password = "パスワードは必須です";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);

		try {
			const returnUrl = sessionStorage.getItem("returnUrl") || "/";
			sessionStorage.removeItem("returnUrl");

			login({ username: email, password });
			navigate(returnUrl);
		} catch (error) {
			console.error("Login failed:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box w="lg" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg">
			<Heading mb={6} textAlign="center">
				ログイン
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

					<Button type="submit" colorScheme="blue" isLoading={false}>
						ログイン
					</Button>
				</Stack>
			</form>
		</Box>
	);
}
