import {
	Box,
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Text,
	VStack,
	useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";

interface DemoVideoModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function DemoVideoModal({
	isOpen,
	onClose,
}: DemoVideoModalProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const handleVideoLoad = () => {
		setIsLoading(false);
		setHasError(false);
	};

	const handleVideoError = () => {
		setIsLoading(false);
		setHasError(true);
	};

	const handleClose = () => {
		setIsLoading(true);
		setHasError(false);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="4xl" isCentered>
			<ModalOverlay bg="blackAlpha.700" />
			<ModalContent bg={useColorModeValue("white", "gray.800")} mx={4}>
				<ModalHeader>
					<Text fontSize="xl" fontWeight="bold">
						Bae Recipe デモ動画
					</Text>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack spacing={4}>
						{isLoading && (
							<Box
								w="full"
								h="400px"
								bg={useColorModeValue("gray.100", "gray.700")}
								rounded="lg"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<Text color={useColorModeValue("gray.500", "gray.400")}>
									動画を読み込み中...
								</Text>
							</Box>
						)}

						{hasError && (
							<Box
								w="full"
								h="400px"
								bg={useColorModeValue("red.50", "red.900")}
								rounded="lg"
								display="flex"
								alignItems="center"
								justifyContent="center"
								flexDirection="column"
							>
								<Text color="red.500" mb={4} fontSize="lg" fontWeight="bold">
									動画の読み込みに失敗しました
								</Text>
								<Text color={useColorModeValue("gray.600", "gray.300")} mb={4}>
									ネットワーク接続を確認してください
								</Text>
								<Button
									colorScheme="red"
									variant="outline"
									onClick={() => {
										setHasError(false);
										setIsLoading(true);
									}}
								>
									再試行
								</Button>
							</Box>
						)}

						<Box
							w="full"
							rounded="lg"
							overflow="hidden"
							display={isLoading || hasError ? "none" : "block"}
						>
							<video
								width="100%"
								height="400"
								controls
								onLoadedData={handleVideoLoad}
								onError={handleVideoError}
								style={{
									borderRadius: "8px",
									backgroundColor: "#000",
								}}
							>
								<source
									src={`${import.meta.env.VITE_PUBLIC_API_URL}/blob/movie/demo.mp4`}
									type="video/mp4"
								/>
								<Text color={useColorModeValue("gray.600", "gray.300")}>
									お使いのブラウザは動画の再生をサポートしていません。
								</Text>
								<track
									kind="captions"
									src={`${import.meta.env.VITE_PUBLIC_API_URL}/blob/captions-ja.vtt`}
									label="English captions"
									default
								/>
							</video>
						</Box>

						<Text
							fontSize="sm"
							color={useColorModeValue("gray.600", "gray.300")}
							textAlign="center"
						>
							Bae Recipeの基本的な使い方をご覧いただけます
						</Text>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
