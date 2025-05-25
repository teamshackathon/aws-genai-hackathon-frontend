import GitHubLoginButton from "@/components/atoms/GitHubLoginButton";
import LoginForm from "@/components/atoms/LoginForm";
import { Box, Divider, Text, VStack } from "@chakra-ui/react";

export default function LoginPage() {
	return (
		<Box w="lg" mx="auto" mt={8}>
			<LoginForm />

			<Box my={4} textAlign="center">
				<Divider my={4} />
				<Text mb={4}>または</Text>
				<VStack spacing={4}>
					<GitHubLoginButton />
				</VStack>
			</Box>
		</Box>
	);
}
