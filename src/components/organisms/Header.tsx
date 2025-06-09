import {
	Box,
	Flex,
	HStack,
	Icon,
	Input,
	InputGroup,
	InputLeftElement,
	Spacer,
	Text,
	useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaCookieBite, FaSearch } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

import SiderDrawer from "@/components/molecules/SiderDrawer";
import AvatarIconMenu from "../atoms/AvatarIconMenu";

// Motion components
const MotionBox = motion(Box);

export default function Header() {
	const [searchValue, setSearchValue] = useState("");

	const bgGradient = useColorModeValue(
		"linear(to-r, orange.400, pink.400)",
		"linear(to-r, orange.600, pink.600)",
	);
	const textColor = "white";
	const searchBg = useColorModeValue("whiteAlpha.200", "whiteAlpha.300");
	const searchBorder = useColorModeValue("whiteAlpha.300", "whiteAlpha.400");

	return (
		<>
			<MotionBox
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
			>
				<Flex
					bgGradient={bgGradient}
					alignItems="center"
					px={6}
					py={4}
					shadow="lg"
					position="sticky"
					top={0}
					zIndex={1000}
					backdropFilter="blur(10px)"
				>
					{/* 左側: サイドバーボタンとロゴ */}
					<HStack spacing={4}>
						<SiderDrawer />
						<MotionBox
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.2 }}
						>
							<HStack spacing={2}>
								<Icon as={FaCookieBite} boxSize={8} color={textColor} />
								<Text
									fontSize={{ base: "xl", md: "2xl" }}
									fontWeight="bold"
									color={textColor}
									letterSpacing="tight"
								>
									BAE RECIPE
								</Text>
								<Icon as={HiSparkles} boxSize={5} color="yellow.200" />
							</HStack>
						</MotionBox>{" "}
					</HStack>

					{/* 中央: 検索窓 */}
					<MotionBox
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						flex={2}
						maxW="100%"
						mx={{ base: 4, md: 8 }}
						display={{ base: "none", md: "block" }}
					>
						<InputGroup w={"100%"} size="lg">
							<InputLeftElement pointerEvents="none" h="full">
								<Icon as={FaSearch} color="whiteAlpha.700" boxSize={5} />
							</InputLeftElement>
							<Input
								placeholder="レシピを検索..."
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								bg={searchBg}
								border="1px"
								borderColor={searchBorder}
								color={textColor}
								fontSize="md"
								h="48px"
								pl={12}
								_placeholder={{ color: "whiteAlpha.700" }}
								_focus={{
									bg: "whiteAlpha.300",
									borderColor: "whiteAlpha.500",
									boxShadow: "0 0 0 1px rgba(255,255,255,0.3)",
								}}
								_hover={{
									bg: "whiteAlpha.250",
									borderColor: "whiteAlpha.400",
								}}
								rounded="full"
								transition="all 0.3s"
								w={"100%"}
							/>
						</InputGroup>
					</MotionBox>

					<Spacer />

					{/* 右側: アバターメニュー */}
					<MotionBox
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<AvatarIconMenu />
					</MotionBox>
				</Flex>
			</MotionBox>
		</>
	);
}
