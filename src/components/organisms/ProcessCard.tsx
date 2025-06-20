import {
	createProcessAtom,
	deleteProcessAtom,
	getProcessesAtom,
	updateProcessAtom,
} from "@/lib/atom/RecipeAtom";
import type { Process } from "@/lib/domain/RecipeQuery";
import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	HStack,
	Heading,
	IconButton,
	Image,
	Input,
	List,
	ListItem,
	Text,
	Textarea,
	VStack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { useState } from "react";
import {
	FaArrowDown,
	FaArrowUp,
	FaEdit,
	FaPlus,
	FaSave,
	FaTimes,
	FaTrash,
} from "react-icons/fa";

const MotionCard = motion(Card);

interface ProcessCardProps {
	processes: Process[];
	recipeId: number;
	isLoading?: boolean;
	editable?: boolean;
}

export default function ProcessCard({
	processes,
	recipeId,
	isLoading = false,
	editable = false,
}: ProcessCardProps) {
	const toast = useToast();
	const [isEditing, setIsEditing] = useState(false);
	const [editingProcesses, setEditingProcesses] = useState<Process[]>([]);
	const [newProcess, setNewProcess] = useState({
		process: "",
		processNumber: 0,
	});
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [deletedProcessIds, setDeletedProcessIds] = useState<number[]>([]);
	const [pendingNewProcesses, setPendingNewProcesses] = useState<
		Array<{ process: string; processNumber: number; tempId: string }>
	>([]);

	// Atom actions
	const createProcess = useSetAtom(createProcessAtom);
	const updateProcess = useSetAtom(updateProcessAtom);
	const deleteProcess = useSetAtom(deleteProcessAtom);
	const refreshProcesses = useSetAtom(getProcessesAtom);

	// Color values
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const headingColor = useColorModeValue("gray.800", "white");

	// Start editing mode
	const handleStartEdit = () => {
		setIsEditing(true);
		setEditingProcesses([
			...processes.sort((a, b) => a.processNumber - b.processNumber),
		]);
	};

	// Cancel editing
	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditingProcesses([]);
		setNewProcess({ process: "", processNumber: 0 });
		setIsAddingNew(false);
		setDeletedProcessIds([]);
		setPendingNewProcesses([]);
	};

	// Save all changes
	const handleSaveChanges = async () => {
		try {
			// Delete marked processes first
			for (const processId of deletedProcessIds) {
				await deleteProcess(processId);
			}

			// Update existing processes
			for (const editedProcess of editingProcesses) {
				// Skip if this process is marked for deletion
				if (deletedProcessIds.includes(editedProcess.id)) {
					continue;
				}

				const originalProcess = processes.find(
					(proc) => proc.id === editedProcess.id,
				);
				if (
					originalProcess &&
					(originalProcess.process !== editedProcess.process ||
						originalProcess.processNumber !== editedProcess.processNumber)
				) {
					await updateProcess(
						editedProcess.id,
						editedProcess.processNumber,
						editedProcess.process,
					);
				}
			}

			// Add new processes
			for (const pendingProcess of pendingNewProcesses) {
				await createProcess(
					recipeId,
					pendingProcess.processNumber,
					pendingProcess.process,
				);
			}

			// Add current new process if exists
			if (newProcess.process && newProcess.processNumber > 0) {
				await createProcess(
					recipeId,
					newProcess.processNumber,
					newProcess.process,
				);
			}

			// Refresh processes list
			await refreshProcesses(recipeId);

			toast({
				title: "調理手順を更新しました",
				status: "success",
				duration: 2000,
				isClosable: true,
			});

			setIsEditing(false);
			setEditingProcesses([]);
			setNewProcess({ process: "", processNumber: 0 });
			setIsAddingNew(false);
			setDeletedProcessIds([]);
			setPendingNewProcesses([]);
		} catch (error) {
			toast({
				title: "更新に失敗しました",
				description: "もう一度お試しください",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	// Mark process for deletion
	const handleMarkForDeletion = (processId: number) => {
		setDeletedProcessIds((prev) => [...prev, processId]);
		setEditingProcesses((prev) => prev.filter((proc) => proc.id !== processId));
	};

	// Restore process from deletion
	const handleRestoreProcess = (processId: number) => {
		setDeletedProcessIds((prev) => prev.filter((id) => id !== processId));
		const originalProcess = processes.find((proc) => proc.id === processId);
		if (originalProcess) {
			setEditingProcesses((prev) =>
				[...prev, originalProcess].sort(
					(a, b) => a.processNumber - b.processNumber,
				),
			);
		}
	};

	// Update editing process
	const updateEditingProcess = (
		id: number,
		field: "process" | "processNumber",
		value: string | number,
	) => {
		setEditingProcesses((prev) =>
			prev
				.map((proc) => (proc.id === id ? { ...proc, [field]: value } : proc))
				.sort((a, b) => a.processNumber - b.processNumber),
		);
	};

	// Move process up/down
	const moveProcess = (id: number, direction: "up" | "down") => {
		const currentIndex = editingProcesses.findIndex((proc) => proc.id === id);
		if (currentIndex === -1) return;

		const newProcesses = [...editingProcesses];
		const targetIndex =
			direction === "up" ? currentIndex - 1 : currentIndex + 1;

		if (targetIndex >= 0 && targetIndex < newProcesses.length) {
			// Swap process numbers
			const temp = newProcesses[currentIndex].processNumber;
			newProcesses[currentIndex].processNumber =
				newProcesses[targetIndex].processNumber;
			newProcesses[targetIndex].processNumber = temp;

			// Re-sort by process number
			setEditingProcesses(
				newProcesses.sort((a, b) => a.processNumber - b.processNumber),
			);
		}
	};

	// Add new process to pending list
	const handleAddNewProcess = () => {
		if (newProcess.process && newProcess.processNumber > 0) {
			const tempId = `temp-${Date.now()}`;
			setPendingNewProcesses((prev) =>
				[
					...prev,
					{
						...newProcess,
						tempId,
					},
				].sort((a, b) => a.processNumber - b.processNumber),
			);
			setNewProcess({ process: "", processNumber: getNextProcessNumber() });
			setIsAddingNew(false);
		}
	};

	// Remove pending new process
	const handleRemovePendingProcess = (tempId: string) => {
		setPendingNewProcesses((prev) =>
			prev.filter((proc) => proc.tempId !== tempId),
		);
	};

	// Get next available process number
	const getNextProcessNumber = () => {
		const allNumbers = [
			...editingProcesses.map((p) => p.processNumber),
			...pendingNewProcesses.map((p) => p.processNumber),
		];
		return Math.max(0, ...allNumbers) + 1;
	};

	// Initialize new process number when starting to add
	const handleStartAddingNew = () => {
		setIsAddingNew(true);
		setNewProcess({ process: "", processNumber: getNextProcessNumber() });
	};

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
				<HStack spacing={3} justify="space-between">
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

					{editable && !isLoading && (
						<HStack spacing={2}>
							{!isEditing ? (
								<IconButton
									aria-label="調理手順を編集"
									icon={<FaEdit />}
									size="sm"
									colorScheme="blue"
									variant="ghost"
									onClick={handleStartEdit}
								/>
							) : (
								<>
									<IconButton
										aria-label="キャンセル"
										icon={<FaTimes />}
										size="sm"
										colorScheme="gray"
										variant="ghost"
										onClick={handleCancelEdit}
									/>
									<IconButton
										aria-label="保存"
										icon={<FaSave />}
										size="sm"
										colorScheme="green"
										variant="ghost"
										onClick={handleSaveChanges}
									/>
								</>
							)}
						</HStack>
					)}
				</HStack>
			</CardHeader>
			<CardBody pt={0}>
				{!isLoading && processes.length > 0 ? (
					<VStack spacing={3} align="stretch">
						<List spacing={4}>
							{(isEditing ? editingProcesses : processes)
								.sort((a, b) => a.processNumber - b.processNumber)
								.map((process, index) => (
									<ListItem
										key={process.id}
										p={4}
										bg={useColorModeValue("gray.50", "gray.700")}
										rounded="lg"
										border="1px"
										borderColor={borderColor}
										position="relative"
									>
										{isEditing ? (
											<VStack spacing={3} align="stretch">
												<HStack spacing={2}>
													<Input
														value={process.processNumber}
														onChange={(e) =>
															updateEditingProcess(
																process.id,
																"processNumber",
																Number(e.target.value),
															)
														}
														placeholder="手順番号"
														size="sm"
														bg={useColorModeValue("white", "gray.600")}
														w="80px"
														type="number"
														min="1"
													/>
													<VStack spacing={1}>
														<IconButton
															aria-label="上に移動"
															icon={<FaArrowUp />}
															size="xs"
															colorScheme="gray"
															variant="ghost"
															onClick={() => moveProcess(process.id, "up")}
															isDisabled={index === 0}
														/>
														<IconButton
															aria-label="下に移動"
															icon={<FaArrowDown />}
															size="xs"
															colorScheme="gray"
															variant="ghost"
															onClick={() => moveProcess(process.id, "down")}
															isDisabled={index === editingProcesses.length - 1}
														/>
													</VStack>
													<IconButton
														aria-label="削除"
														icon={<FaTrash />}
														size="sm"
														colorScheme="red"
														variant="ghost"
														onClick={() => handleMarkForDeletion(process.id)}
													/>
												</HStack>
												<Textarea
													value={process.process}
													onChange={(e) =>
														updateEditingProcess(
															process.id,
															"process",
															e.target.value,
														)
													}
													placeholder="調理手順の詳細"
													size="sm"
													bg={useColorModeValue("white", "gray.600")}
													minH="100px"
													resize="vertical"
												/>
											</VStack>
										) : (
											<>
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
											</>
										)}
									</ListItem>
								))}
						</List>

						{/* Pending new processes (added but not saved) */}
						{isEditing && pendingNewProcesses.length > 0 && (
							<Box
								p={3}
								bg={useColorModeValue("green.50", "green.900")}
								rounded="lg"
								border="1px"
								borderColor="green.200"
							>
								<Text
									fontSize="sm"
									fontWeight="semibold"
									color="green.600"
									mb={2}
								>
									追加予定の手順 ({pendingNewProcesses.length}件)
								</Text>
								<VStack spacing={2} align="stretch">
									{pendingNewProcesses
										.sort((a, b) => a.processNumber - b.processNumber)
										.map((process) => (
											<HStack
												key={process.tempId}
												p={2}
												bg={useColorModeValue("green.100", "green.800")}
												rounded="md"
												justify="space-between"
												align="start"
											>
												<VStack align="start" spacing={1} flex={1}>
													<Text
														fontSize="sm"
														color="green.700"
														fontWeight="medium"
													>
														手順{process.processNumber}
													</Text>
													<Text fontSize="sm" color="green.700">
														{process.process}
													</Text>
												</VStack>
												<Button
													size="xs"
													colorScheme="red"
													variant="outline"
													onClick={() =>
														handleRemovePendingProcess(process.tempId)
													}
												>
													削除
												</Button>
											</HStack>
										))}
								</VStack>
							</Box>
						)}

						{/* Deleted processes (marked for deletion) */}
						{isEditing && deletedProcessIds.length > 0 && (
							<Box
								p={3}
								bg={useColorModeValue("red.50", "red.900")}
								rounded="lg"
								border="1px"
								borderColor="red.200"
							>
								<Text
									fontSize="sm"
									fontWeight="semibold"
									color="red.600"
									mb={2}
								>
									削除予定の手順 ({deletedProcessIds.length}件)
								</Text>
								<VStack spacing={2} align="stretch">
									{processes
										.filter((proc) => deletedProcessIds.includes(proc.id))
										.map((process) => (
											<HStack
												key={process.id}
												p={2}
												bg={useColorModeValue("red.100", "red.800")}
												rounded="md"
												justify="space-between"
												align="start"
											>
												<VStack align="start" spacing={1} flex={1}>
													<Text
														fontSize="sm"
														color="red.700"
														textDecoration="line-through"
														fontWeight="medium"
													>
														手順{process.processNumber}
													</Text>
													<Text
														fontSize="sm"
														color="red.700"
														textDecoration="line-through"
													>
														{process.process}
													</Text>
												</VStack>
												<Button
													size="xs"
													colorScheme="red"
													variant="outline"
													onClick={() => handleRestoreProcess(process.id)}
												>
													復元
												</Button>
											</HStack>
										))}
								</VStack>
							</Box>
						)}

						{/* Add new process form */}
						{isEditing && (
							<Box
								p={3}
								bg={useColorModeValue("blue.50", "blue.900")}
								rounded="lg"
								border="1px"
								borderColor="blue.200"
							>
								{!isAddingNew ? (
									<Button
										leftIcon={<FaPlus />}
										size="sm"
										colorScheme="blue"
										variant="ghost"
										onClick={handleStartAddingNew}
										w="full"
									>
										新しい手順を追加
									</Button>
								) : (
									<VStack spacing={3}>
										<HStack spacing={2} w="full">
											<Input
												value={newProcess.processNumber}
												onChange={(e) =>
													setNewProcess((prev) => ({
														...prev,
														processNumber: Number(e.target.value),
													}))
												}
												placeholder="手順番号"
												size="sm"
												bg={useColorModeValue("white", "gray.600")}
												w="100px"
												type="number"
												min="1"
											/>
											<Text fontSize="sm" color="gray.500">
												手順{newProcess.processNumber}
											</Text>
										</HStack>
										<Textarea
											value={newProcess.process}
											onChange={(e) =>
												setNewProcess((prev) => ({
													...prev,
													process: e.target.value,
												}))
											}
											placeholder="調理手順の詳細を入力してください"
											size="sm"
											bg={useColorModeValue("white", "gray.600")}
											minH="100px"
											resize="vertical"
										/>
										<HStack spacing={2} w="full">
											<Button
												size="sm"
												colorScheme="gray"
												variant="ghost"
												onClick={() => {
													setIsAddingNew(false);
													setNewProcess({ process: "", processNumber: 0 });
												}}
												flex={1}
											>
												キャンセル
											</Button>
											<Button
												size="sm"
												colorScheme="blue"
												onClick={handleAddNewProcess}
												isDisabled={
													!newProcess.process || newProcess.processNumber <= 0
												}
												flex={1}
											>
												追加
											</Button>
										</HStack>
									</VStack>
								)}
							</Box>
						)}
					</VStack>
				) : (
					<Text color={textColor} textAlign="center" py={8}>
						{isLoading ? "調理手順が読み込み中です..." : "調理手順がありません"}
					</Text>
				)}
			</CardBody>
		</MotionCard>
	);
}
