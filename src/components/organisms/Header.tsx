import { Box, Flex, Spacer, Text } from "@chakra-ui/react";

import AvatarIconMenu from "../atoms/AvatarIconMenu";

export default function Header() {
	return (
		<Flex bg={"lightblue"} alignItems="center" p={1}>
			<Box ml={1}>
				<Text fontSize="4xl" fontWeight="bold">
					BAE RECIPE
				</Text>
			</Box>
			<Spacer />
			<Box mr={1}>
				<AvatarIconMenu />
			</Box>
		</Flex>
	);
}
