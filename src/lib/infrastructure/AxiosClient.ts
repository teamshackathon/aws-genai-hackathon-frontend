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

		// リクエストインターセプターを設定
		this.setupInterceptors();
	}

	async get<T>(url: string): Promise<AxiosResponse<T>> {
		const response = await this.axiosInstance.get<T>(url, this.recequestConfig);
		return response;
	}

	async post<T, U>(url: string, data: T): Promise<AxiosResponse<U>> {
		const response = await this.axiosInstance.post<U>(
			url,
			data,
			this.recequestConfig,
		);
		return response;
	}

	async put<T, U>(url: string, data: T): Promise<AxiosResponse<U>> {
		const response = await this.axiosInstance.put<U>(
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

	async login<T, U>(url: string, data: T): Promise<AxiosResponse<U>> {
		const response = await this.axiosInstance.post<U>(
			url,
			data,
			this.loginRequestConfig,
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

	private get loginRequestConfig(): AxiosRequestConfig {
		return {
			baseURL: this.baseURL,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};
	}

	private setupInterceptors() {
		// リクエスト送信前に実行
		this.axiosInstance.interceptors.request.use(
			(config) => {
				// ローカルストレージからトークンを取得し、ダブルクォーテーションを除去
				const rawToken = localStorage.getItem("auth_token");
				let token = null;

				if (rawToken) {
					// ダブルクォーテーションを除去
					token = rawToken.replace(/^"|"$/g, "");
				}

				// トークンがある場合はAuthorizationヘッダーに設定
				if (token && config.headers) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			},
		);

		// レスポンス受信時に実行
		this.axiosInstance.interceptors.response.use(
			(response) => {
				return response;
			},
			(error) => {
				// 401エラー（認証エラー）の場合
				if (error.response && error.response.status === 401) {
					// ここに認証切れの処理を追加
					// 例: リフレッシュトークンの処理やログアウト処理
					console.error("認証エラー: トークンが無効または期限切れです");
				}
				return Promise.reject(error);
			},
		);
	}
}

export function createAxiosClient(): AxiosClient {
	return new AxiosClient();
}
