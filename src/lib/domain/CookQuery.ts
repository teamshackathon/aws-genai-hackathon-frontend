import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

export class CookHistory {
	constructor(
		public id: string,
		public userId: number,
		public recipeId: number,
		public cookedAt: Date,
	) {}
}

export interface CookHistoryResponse {
	id: string;
	user_id: number;
	recipe_id: number;
	cooked_at: string; // ISO 8601形式の文字列
}

export interface CookHistoryRequest {
	recipe_id: number;
}

function createCookHistory(res: CookHistoryResponse): CookHistory {
	return new CookHistory(
		res.id,
		res.user_id,
		res.recipe_id,
		new Date(res.cooked_at),
	);
}

export async function getCookHistory(recipeId: number): Promise<CookHistory[]> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<CookHistoryResponse[]>(
		`/cook/history/${recipeId}`,
	);
	return response.data.map(createCookHistory);
}

export async function postCookHistory(
	request: CookHistoryRequest,
): Promise<CookHistory> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.post<
		CookHistoryRequest,
		CookHistoryResponse
	>("/cook", request);
	return createCookHistory(response.data);
}
