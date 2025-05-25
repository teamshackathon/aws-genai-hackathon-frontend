import { Button, Icon, Text } from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import { FaGithub } from "react-icons/fa";

import { loginInGithubAtom } from "@/lib/atom/AuthAtom";

export default function GitHubLoginButton() {
	const setLoginInGithub = useSetAtom(loginInGithubAtom);

	return (
		<Button
			onClick={setLoginInGithub}
			leftIcon={<Icon as={FaGithub} />}
			colorScheme="gray"
			variant="outline"
			width="full"
		>
			<Text>GitHubでログイン</Text>
		</Button>
	);
}
