export interface SettingsData {
	notifications: {
		email: boolean;
		push: boolean;
		recipeUpdates: boolean;
		newsletter: boolean;
	};
	appearance: {
		fontSize: number;
		language: string;
	};
	privacy: {
		profileVisibility: string;
		dataCollection: boolean;
		cookieSettings: boolean;
		shareAnalytics: boolean;
	};
	account: {
		twoFactorAuth: boolean;
		sessionTimeout: number;
		downloadData: boolean;
	};
}
