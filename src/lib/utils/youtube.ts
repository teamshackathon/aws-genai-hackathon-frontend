/**
 * YouTube関連のユーティリティ関数
 */

/**
 * YouTube URLから動画IDを抽出する
 * @param url YouTube URL
 * @returns 動画ID（11桁の英数字）またはnull
 */
export function extractYouTubeVideoId(url: string): string | null {
	if (!url) return null;

	// YouTube ShortsとYouTube通常動画の両方に対応
	const patterns = [
		// YouTube Shorts
		/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
		// YouTube通常動画
		/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
		// YouTube短縮URL
		/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) {
			return match[1];
		}
	}

	return null;
}

/**
 * YouTube動画IDからサムネイルURLを生成する
 * @param videoId YouTube動画ID
 * @param quality サムネイルの品質 ('default' | 'medium' | 'high' | 'standard' | 'maxres')
 * @returns サムネイルURL
 */
export function getYouTubeThumbnailUrl(
	videoId: string,
	quality: "default" | "medium" | "high" | "standard" | "maxres" = "high",
): string {
	const qualityMap = {
		default: "default",
		medium: "mqdefault",
		high: "hqdefault",
		standard: "sddefault",
		maxres: "maxresdefault",
	};

	return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * YouTube動画の埋め込みURLを生成する
 * @param videoId YouTube動画ID
 * @param options 埋め込みオプション
 * @returns 埋め込みURL
 */
export function getYouTubeEmbedUrl(
	videoId: string,
	options: {
		autoplay?: boolean;
		mute?: boolean;
		controls?: boolean;
		loop?: boolean;
	} = {},
): string {
	const params = new URLSearchParams();

	if (options.autoplay) params.set("autoplay", "1");
	if (options.mute) params.set("mute", "1");
	if (options.controls === false) params.set("controls", "0");
	if (options.loop) params.set("loop", "1");

	const queryString = params.toString();
	return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ""}`;
}
