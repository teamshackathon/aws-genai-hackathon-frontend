import type { SettingsData } from "@/lib/type/Base";
import { atomWithReset } from "jotai/utils";

export const toastAtom = atomWithReset({ status: "", message: "" });

export const settingsAtom = atomWithReset<SettingsData>({
	notifications: {
		email: true,
		push: true,
		recipeUpdates: true,
		newsletter: true,
	},
	appearance: {
		fontSize: 16,
		language: "ja",
	},
	privacy: {
		profileVisibility: "public",
		dataCollection: true,
		cookieSettings: true,
		shareAnalytics: false,
	},
	account: {
		twoFactorAuth: false,
		sessionTimeout: 30,
		downloadData: false,
	},
});
