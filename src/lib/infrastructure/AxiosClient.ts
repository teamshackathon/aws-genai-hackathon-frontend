import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
} from "axios";

export class AxiosClient {
	private axiosInstance: AxiosInstance;

	constructor() {
		this.axiosInstance = axios.create({
			baseURL: this.baseURL,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});
	}

	async get<T>(url: string): Promise<AxiosResponse<T>> {
		const response = await this.axiosInstance.get<T>(url, this.recequestConfig);
		return response;
	}

	async post<T>(url: string, data: T): Promise<AxiosResponse<T>> {
		const response = await this.axiosInstance.post<T>(
			url,
			data,
			this.recequestConfig,
		);
		return response;
	}

	async put<T>(url: string, data: T): Promise<AxiosResponse<T>> {
		const response = await this.axiosInstance.put<T>(
			url,
			data,
			this.recequestConfig,
		);
		return response;
	}

	async delete<T>(url: string): Promise<AxiosResponse<T>> {
		const response = await this.axiosInstance.delete<T>(
			url,
			this.recequestConfig,
		);
		return response;
	}

	private baseURL: string =
		import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api/v1";

	private get recequestConfig(): AxiosRequestConfig {
		return {
			baseURL: this.baseURL,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		};
	}
}

export function createAxiosClient(): AxiosClient {
	return new AxiosClient();
}
