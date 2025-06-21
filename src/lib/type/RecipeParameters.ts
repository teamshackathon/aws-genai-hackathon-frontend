/**
 * レシピ生成時のカスタムパラメータ設定を定義する型
 * MainPageで設定された内容がRecipeAIGenPageに渡される
 * ProfilePageの表示値と中身を一致させて定義
 */
export interface RecipeParameters {
	/** 人数設定 (ProfilePage: servingSize) */
	peopleCount: "1" | "2" | "3" | "4" | "5" | "6" | "レシピ通り";

	/** 調理時間設定 (ProfilePage: cookingTimePreference) */
	cookingTime: "15分以内" | "30分以内" | "1時間以内" | "レシピ通り";

	/** 重視する傾向 (ProfilePage: preferenceTrend) */
	preference:
		| "栄養重視"
		| "見栄え重視"
		| "コスパ重視"
		| "タイパ重視"
		| "レシピ通り";

	/** 塩味の強さ (ProfilePage: saltPreference) */
	saltiness: "濃いめ" | "普通" | "薄味" | "レシピ通り";

	/** 甘味の強さ (ProfilePage: sweetnessPreference) */
	sweetness: "甘め" | "普通" | "控えめ" | "レシピ通り";

	/** 辛味の強さ (ProfilePage: spicinessPreference) */
	spiciness:
		| "とても辛い"
		| "辛め"
		| "普通"
		| "少し辛い"
		| "辛くない"
		| "レシピ通り";

	/** 嫌いな食材（自由記述） (ProfilePage: dislikedIngredients) */
	dislikedIngredients?: string;
}
