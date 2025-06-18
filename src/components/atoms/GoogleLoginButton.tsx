import { Button, Icon, Text } from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import { FaGoogle } from "react-icons/fa";

import { loginInGoogleAtom } from "@/lib/atom/AuthAtom";

export default function GoogleLoginButton() {
	const setLoginInGoogle = useSetAtom(loginInGoogleAtom);

	return (
		<Button
			onClick={setLoginInGoogle}
			leftIcon={<Icon as={FaGoogle} />}
			colorScheme="gray"
			variant="outline"
			width="full"
		>
			<Text>Googleでログイン</Text>
		</Button>
	);
}
