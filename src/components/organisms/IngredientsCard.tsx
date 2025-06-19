import {
	createIngredientAtom,
	deleteIngredientAtom,
	getIngridientsAtom,
	updateIngredientAtom,
} from "@/lib/atom/RecipeAtom";
import type { Ingridient } from "@/lib/domain/RecipeQuery";
import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Input,
	List,
	ListItem,
	Text,
	VStack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { useState } from "react";
import {
	FaEdit,
	FaPlus,
	FaSave,
	FaShoppingCart,
	FaTimes,
	FaTrash,
} from "react-icons/fa";

const MotionCard = motion(Card);

interface IngredientsCardProps {
	ingredients: Ingridient[];
	recipeId: number;
	isLoading?: boolean;
	editable?: boolean;
}

export default function IngredientsCard({
	ingredients,
	recipeId,
	isLoading = false,
	editable = false,
}: IngredientsCardProps) {
	const toast = useToast();
	const [isEditing, setIsEditing] = useState(false);
	const [editingIngredients, setEditingIngredients] = useState<Ingridient[]>(
		[],
	);
	const [newIngredient, setNewIngredient] = useState({
		ingredient: "",
		amount: "",
	});
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [deletedIngredientIds, setDeletedIngredientIds] = useState<number[]>(
		[],
	);
	const [pendingNewIngredients, setPendingNewIngredients] = useState<
		Array<{ ingredient: string; amount: string; tempId: string }>
	>([]);

	// Atom actions
	const createIngredient = useSetAtom(createIngredientAtom);
	const updateIngredient = useSetAtom(updateIngredientAtom);
	const deleteIngredient = useSetAtom(deleteIngredientAtom);
	const refreshIngredients = useSetAtom(getIngridientsAtom);

	// Color values
	const cardBg = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.300");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const headingColor = useColorModeValue("gray.800", "white");

	// Start editing mode
	const handleStartEdit = () => {
		setIsEditing(true);
		setEditingIngredients([...ingredients]);
	}; // Cancel editing
	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditingIngredients([]);
		setNewIngredient({ ingredient: "", amount: "" });
		setIsAddingNew(false);
		setDeletedIngredientIds([]);
		setPendingNewIngredients([]);
	};
	// Save all changes
	const handleSaveChanges = async () => {
		try {
			// Delete marked ingredients first
			for (const ingredientId of deletedIngredientIds) {
				await deleteIngredient(ingredientId);
			}

			// Update existing ingredients
			for (const editedIngredient of editingIngredients) {
				// Skip if this ingredient is marked for deletion
				if (deletedIngredientIds.includes(editedIngredient.id)) {
					continue;
				}

				const originalIngredient = ingredients.find(
					(ing) => ing.id === editedIngredient.id,
				);
				if (
					originalIngredient &&
					(originalIngredient.ingredient !== editedIngredient.ingredient ||
						originalIngredient.amount !== editedIngredient.amount)
				) {
					await updateIngredient(
						editedIngredient.id,
						editedIngredient.ingredient,
						editedIngredient.amount,
					);
				}
			} // Add new ingredients
			for (const pendingIngredient of pendingNewIngredients) {
				await createIngredient(
					recipeId,
					pendingIngredient.ingredient,
					pendingIngredient.amount,
				);
			}

			// Add current new ingredient if exists
			if (newIngredient.ingredient && newIngredient.amount) {
				await createIngredient(
					recipeId,
					newIngredient.ingredient,
					newIngredient.amount,
				);
			}

			// Refresh ingredients list
			await refreshIngredients(recipeId);

			toast({
				title: "材料を更新しました",
				status: "success",
				duration: 2000,
				isClosable: true,
			});

			setIsEditing(false);
			setEditingIngredients([]);
			setNewIngredient({ ingredient: "", amount: "" });
			setIsAddingNew(false);
			setDeletedIngredientIds([]);
			setPendingNewIngredients([]);
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
	// Mark ingredient for deletion (don't delete immediately)
	const handleMarkForDeletion = (ingredientId: number) => {
		setDeletedIngredientIds((prev) => [...prev, ingredientId]);
		// Remove from editing ingredients to hide it from UI
		setEditingIngredients((prev) =>
			prev.filter((ing) => ing.id !== ingredientId),
		);
	};

	// Restore ingredient from deletion
	const handleRestoreIngredient = (ingredientId: number) => {
		setDeletedIngredientIds((prev) => prev.filter((id) => id !== ingredientId));
		// Restore to editing ingredients
		const originalIngredient = ingredients.find(
			(ing) => ing.id === ingredientId,
		);
		if (originalIngredient) {
			setEditingIngredients((prev) => [...prev, originalIngredient]);
		}
	};
	// Update editing ingredient
	const updateEditingIngredient = (
		id: number,
		field: "ingredient" | "amount",
		value: string,
	) => {
		setEditingIngredients((prev) =>
			prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)),
		);
	};

	// Add new ingredient to pending list
	const handleAddNewIngredient = () => {
		if (newIngredient.ingredient && newIngredient.amount) {
			const tempId = `temp-${Date.now()}`;
			setPendingNewIngredients((prev) => [
				...prev,
				{
					...newIngredient,
					tempId,
				},
			]);
			setNewIngredient({ ingredient: "", amount: "" });
			setIsAddingNew(false);
		}
	};

	// Remove pending new ingredient
	const handleRemovePendingIngredient = (tempId: string) => {
		setPendingNewIngredients((prev) =>
			prev.filter((ing) => ing.tempId !== tempId),
		);
	};
	return (
		<MotionCard
			bg={cardBg}
			shadow="xl"
			rounded="2xl"
			border="1px"
			borderColor={borderColor}
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6, delay: 0.2 }}
		>
			<CardHeader pb={4}>
				<HStack spacing={3} justify="space-between">
					<HStack spacing={3}>
						<Icon as={FaShoppingCart} boxSize={6} color="green.500" />
						<Heading size="lg" color={headingColor}>
							材料
						</Heading>
						<Badge colorScheme="green" variant="subtle">
							{ingredients.length}品目
						</Badge>
					</HStack>

					{editable && !isLoading && (
						<HStack spacing={2}>
							{!isEditing ? (
								<IconButton
									aria-label="材料を編集"
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
				{!isLoading && ingredients.length > 0 ? (
					<VStack spacing={3} align="stretch">
						<List spacing={3}>
							{(isEditing ? editingIngredients : ingredients).map(
								(ingredient, index) => (
									<ListItem
										key={ingredient.id}
										p={3}
										bg={useColorModeValue("gray.50", "gray.700")}
										rounded="lg"
										border="1px"
										borderColor={borderColor}
									>
										{isEditing ? (
											<VStack spacing={2} align="stretch">
												<HStack spacing={2}>
													<Box
														w={6}
														h={6}
														bg="green.100"
														color="green.600"
														rounded="full"
														display="flex"
														alignItems="center"
														justifyContent="center"
														fontSize="xs"
														fontWeight="bold"
														flexShrink={0}
													>
														{index + 1}
													</Box>
													<Input
														value={ingredient.ingredient}
														onChange={(e) =>
															updateEditingIngredient(
																ingredient.id,
																"ingredient",
																e.target.value,
															)
														}
														placeholder="材料名"
														size="sm"
														bg={useColorModeValue("white", "gray.600")}
														flex={1}
													/>
													<Input
														value={ingredient.amount}
														onChange={(e) =>
															updateEditingIngredient(
																ingredient.id,
																"amount",
																e.target.value,
															)
														}
														placeholder="分量"
														size="sm"
														bg={useColorModeValue("white", "gray.600")}
														w="100px"
														flexShrink={0}
													/>{" "}
													<IconButton
														aria-label="削除"
														icon={<FaTrash />}
														size="sm"
														colorScheme="red"
														variant="ghost"
														onClick={() => handleMarkForDeletion(ingredient.id)}
													/>
												</HStack>
											</VStack>
										) : (
											<Flex justify="space-between" align="center">
												<HStack spacing={3}>
													<Box
														w={6}
														h={6}
														bg="green.100"
														color="green.600"
														rounded="full"
														display="flex"
														alignItems="center"
														justifyContent="center"
														fontSize="xs"
														fontWeight="bold"
													>
														{index + 1}
													</Box>
													<Text fontWeight="semibold" color={headingColor}>
														{ingredient.ingredient}
													</Text>
												</HStack>
												<Text color={textColor} fontWeight="medium">
													{ingredient.amount}
												</Text>
											</Flex>
										)}
									</ListItem>
								),
							)}{" "}
						</List>

						{/* Pending new ingredients (added but not saved) */}
						{isEditing && pendingNewIngredients.length > 0 && (
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
									追加予定の材料 ({pendingNewIngredients.length}件)
								</Text>
								<VStack spacing={2} align="stretch">
									{pendingNewIngredients.map((ingredient) => (
										<HStack
											key={ingredient.tempId}
											p={2}
											bg={useColorModeValue("green.100", "green.800")}
											rounded="md"
											justify="space-between"
										>
											<HStack spacing={2}>
												<Text
													fontSize="sm"
													color="green.700"
													fontWeight="medium"
												>
													{ingredient.ingredient} - {ingredient.amount}
												</Text>
											</HStack>
											<Button
												size="xs"
												colorScheme="red"
												variant="outline"
												onClick={() =>
													handleRemovePendingIngredient(ingredient.tempId)
												}
											>
												削除
											</Button>
										</HStack>
									))}
								</VStack>
							</Box>
						)}

						{/* Deleted ingredients (marked for deletion) */}
						{isEditing && deletedIngredientIds.length > 0 && (
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
									削除予定の材料 ({deletedIngredientIds.length}件)
								</Text>
								<VStack spacing={2} align="stretch">
									{" "}
									{ingredients
										.filter((ing) => deletedIngredientIds.includes(ing.id))
										.map((ingredient) => (
											<HStack
												key={ingredient.id}
												p={2}
												bg={useColorModeValue("red.100", "red.800")}
												rounded="md"
												justify="space-between"
											>
												<HStack spacing={2}>
													<Text
														fontSize="sm"
														color="red.700"
														textDecoration="line-through"
													>
														{ingredient.ingredient} - {ingredient.amount}
													</Text>
												</HStack>
												<Button
													size="xs"
													colorScheme="red"
													variant="outline"
													onClick={() => handleRestoreIngredient(ingredient.id)}
												>
													復元
												</Button>
											</HStack>
										))}
								</VStack>
							</Box>
						)}

						{/* Add new ingredient form */}
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
										onClick={() => setIsAddingNew(true)}
										w="full"
									>
										新しい材料を追加
									</Button>
								) : (
									<VStack spacing={2}>
										<HStack spacing={2} w="full">
											<Input
												value={newIngredient.ingredient}
												onChange={(e) =>
													setNewIngredient((prev) => ({
														...prev,
														ingredient: e.target.value,
													}))
												}
												placeholder="材料名"
												size="sm"
												bg={useColorModeValue("white", "gray.600")}
											/>
											<Input
												value={newIngredient.amount}
												onChange={(e) =>
													setNewIngredient((prev) => ({
														...prev,
														amount: e.target.value,
													}))
												}
												placeholder="分量"
												size="sm"
												bg={useColorModeValue("white", "gray.600")}
												w="100px"
											/>
										</HStack>
										<HStack spacing={2} w="full">
											<Button
												size="sm"
												colorScheme="gray"
												variant="ghost"
												onClick={() => {
													setIsAddingNew(false);
													setNewIngredient({ ingredient: "", amount: "" });
												}}
												flex={1}
											>
												キャンセル
											</Button>{" "}
											<Button
												size="sm"
												colorScheme="blue"
												onClick={handleAddNewIngredient}
												isDisabled={
													!newIngredient.ingredient || !newIngredient.amount
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
						{isLoading ? "材料が読み込み中です..." : "材料がありません"}
					</Text>
				)}
			</CardBody>
		</MotionCard>
	);
}
