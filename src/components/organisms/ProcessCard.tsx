import type { Process } from "@/lib/domain/RecipeQuery";
import {
	Badge,
	Box,
	Card,
	CardBody,
	CardHeader,
	HStack,
	Heading,
	Image,
	List,
	ListItem,
	Text,
	useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

interface ProcessCardProps {
	processes: Process[];
	isLoading?: boolean;
}

export default function ProcessCard({
	processes,
	isLoading = false,
}: ProcessCardProps) {
	// Color values
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const headingColor = useColorModeValue("gray.800", "white");

	return (
		<MotionCard
			bg={cardBg}
			shadow="xl"
			rounded="2xl"
			border="1px"
			borderColor={borderColor}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6, delay: 0.4 }}
		>
			<CardHeader pb={4}>
				<HStack spacing={3}>
					<Image
						src="/bae-recipe/favicon.svg"
						alt="BAE Recipe Logo"
						boxSize={6}
					/>
					<Heading size="lg" color={headingColor}>
						調理手順
					</Heading>
					<Badge colorScheme="purple" variant="subtle">
						{processes.length}ステップ
					</Badge>
				</HStack>
			</CardHeader>
			<CardBody pt={0}>
				{!isLoading && processes.length > 0 ? (
					<List spacing={4}>
						{processes
							.sort((a, b) => a.processNumber - b.processNumber)
							.map((process) => (
								<ListItem
									key={process.id}
									p={4}
									bg={useColorModeValue("gray.50", "gray.700")}
									rounded="lg"
									border="1px"
									borderColor={borderColor}
									position="relative"
								>
									<Box
										position="absolute"
										top={4}
										left={4}
										w={8}
										h={8}
										bg="purple.100"
										color="purple.600"
										rounded="full"
										display="flex"
										alignItems="center"
										justifyContent="center"
										fontSize="sm"
										fontWeight="bold"
									>
										{process.processNumber}
									</Box>
									<Text
										pl={12}
										color={headingColor}
										lineHeight={1.6}
										whiteSpace="pre-wrap"
									>
										{process.process}
									</Text>
								</ListItem>
							))}
					</List>
				) : (
					<Text color={textColor} textAlign="center" py={8}>
						{isLoading ? "調理手順が読み込み中です..." : "調理手順がありません"}
					</Text>
				)}
			</CardBody>
		</MotionCard>
	);
}
