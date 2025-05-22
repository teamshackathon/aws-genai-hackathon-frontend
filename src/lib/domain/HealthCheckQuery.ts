import { createAxiosClient } from "@/lib/infrastructure/AxiosClient";

class HealthCheck {
	constructor(
		public status: string,
		public check: string,
	) {}
}

export interface HealthCheckResponse {
	status: string;
	check: string;
}

function createHealthCheck(res: HealthCheckResponse): HealthCheck {
	return new HealthCheck(res.status, res.check);
}

export async function getHealthCheckReadiness(): Promise<HealthCheck> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<HealthCheckResponse>(
		"/healthcheck/readiness",
	);
	return createHealthCheck(response.data);
}

export async function getHealthCheckLiveness(): Promise<HealthCheck> {
	const axiosClient = createAxiosClient();
	const response = await axiosClient.get<HealthCheckResponse>(
		"/healthcheck/liveness",
	);
	return createHealthCheck(response.data);
}
