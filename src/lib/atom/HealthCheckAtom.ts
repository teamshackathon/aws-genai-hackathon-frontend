import { atom } from "jotai";

import { loadable } from "jotai/utils";

import {
	getHealthCheckLiveness,
	getHealthCheckReadiness,
} from "@/lib/domain/HealthCheckQuery";

const healthCheckLivenessAtomAsync = atom(async () => {
	try {
		const response = await getHealthCheckLiveness();
		return response;
	} catch (error) {
		console.error("Error fetching health check:", error);
		return null;
	}
});

export const healthCheckLivenessAtomLoadable = loadable(
	healthCheckLivenessAtomAsync,
);

const healthCheckReadinessAtomAsync = atom(async () => {
	try {
		const response = await getHealthCheckReadiness();
		return response;
	} catch (error) {
		console.error("Error fetching health check:", error);
		return null;
	}
});

export const healthCheckReadinessAtomLoadable = loadable(
	healthCheckReadinessAtomAsync,
);
