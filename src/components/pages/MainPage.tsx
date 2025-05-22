import {
	healthCheckLivenessAtomLoadable,
	healthCheckReadinessAtomLoadable,
} from "@/lib/atom/HealthCheckAtom";

import type { HealthCheckResponse } from "@/lib/domain/HealthCheckQuery";
import { useAtomValue } from "jotai";
import type { Loadable } from "jotai/vanilla/utils/loadable"; // ShadCN UI では Lucide アイコンを多用

import { Badge, Box, Flex, Heading, Spinner, Text } from "@chakra-ui/react";

const getStatusDisplay = (
	check: Loadable<Promise<HealthCheckResponse | null>>,
) => {
	if (check.state === "loading") return <Spinner size="sm" />;
	if (check.state === "hasError") return <Badge colorScheme="red">ERROR</Badge>;
	if (check.state === "hasData") {
		return check.data?.status === "ok" ? (
			<Badge colorScheme="green">OK</Badge>
		) : (
			<Badge colorScheme="red">FAIL</Badge>
		);
	}
	return <Badge colorScheme="yellow">UNKNOWN</Badge>;
};

export default function Header() {
	const liveness = useAtomValue(healthCheckLivenessAtomLoadable);
	const readiness = useAtomValue(healthCheckReadinessAtomLoadable);

	return (
		<Box p={4}>
			<Box>
				<Heading as="h1" size="lg" mb={2}>
					Health Check
				</Heading>
				<Flex alignItems="center" mb={1}>
					<Text fontSize="sm" fontWeight="medium" mr={2}>
						Liveness:
					</Text>
					{getStatusDisplay(liveness)}
				</Flex>
				<Flex alignItems="center">
					<Text fontSize="sm" fontWeight="medium" mr={2}>
						Readiness:
					</Text>
					{getStatusDisplay(readiness)}
				</Flex>
			</Box>
		</Box>
	);
}
