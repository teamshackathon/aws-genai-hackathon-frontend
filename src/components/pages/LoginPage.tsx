import LoginBox from "@/components/organisms/LoginBox";

import { Box, Center, VStack } from "@chakra-ui/react";

export default function LoginPage() {
	return (
		<Box>
			<Center minH="100vh">
				<VStack spacing={4}>
					<LoginBox />
				</VStack>
			</Center>
		</Box>
	);
}
