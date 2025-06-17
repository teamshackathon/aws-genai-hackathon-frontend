import {
	extractYouTubeVideoId,
	getYouTubeThumbnailUrl,
} from "@/lib/utils/youtube";
import { Box, Icon, Image, useColorModeValue } from "@chakra-ui/react";
import type React from "react";
import { FaPlay, FaYoutube } from "react-icons/fa";

interface YouTubeThumbnailProps {
	/**
	 * YouTubeのURL（Shortsまたは通常動画）
	 */
	url?: string;
	/**
	 * 代替テキスト
	 */
	alt: string;
	/**
	 * 高さ
	 */
	height?: string | number;
	/**
	 * 幅
	 */
	width?: string | number;
	/**
	 * オブジェクトフィット
	 */
	objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down" /**
	 * クリック時のハンドラー
	 */;
	onClick?: (e?: React.MouseEvent) => void;
}

/**
 * YouTube動画のサムネイルを表示するコンポーネント
 *
 * YouTube ShortsやYouTube動画のURLからサムネイルを表示し、
 * プレイボタンのオーバーレイを表示してYouTube風の見た目にします。
 */
export const YouTubeThumbnail: React.FC<YouTubeThumbnailProps> = ({
	url,
	alt,
	height = "200px",
	width = "full",
	objectFit = "cover",
	onClick,
}) => {
	const overlayBg = useColorModeValue("blackAlpha.600", "blackAlpha.700");
	const iconColor = useColorModeValue("white", "white");

	// YouTube動画IDを抽出
	const videoId = url ? extractYouTubeVideoId(url) : null;

	// サムネイルURLを生成
	const thumbnailUrl = videoId
		? getYouTubeThumbnailUrl(videoId, "high")
		: undefined;

	// フォールバック画像（YouTube動画でない場合やエラーの場合）
	const fallbackContent = (
		<Box
			h={height}
			w={width}
			bg="gray.200"
			display="flex"
			alignItems="center"
			justifyContent="center"
			flexDirection="column"
			color="gray.500"
			cursor={onClick ? "pointer" : "default"}
			onClick={(e) => onClick?.(e)}
			_hover={onClick ? { opacity: 0.8 } : {}}
			transition="opacity 0.2s"
		>
			<Icon as={FaYoutube} boxSize={8} mb={2} />
			<Box fontSize="sm" textAlign="center" px={4}>
				{url ? "サムネイルを読み込めませんでした" : "YouTube動画なし"}
			</Box>
		</Box>
	);

	if (!thumbnailUrl) {
		return fallbackContent;
	}

	return (
		<Box
			position="relative"
			h={height}
			w={width}
			overflow="hidden"
			cursor={onClick ? "pointer" : "default"}
			onClick={(e) => onClick?.(e)}
			_hover={
				onClick
					? {
							"& > .overlay": {
								opacity: 1,
							},
						}
					: {}
			}
			transition="all 0.2s"
		>
			{/* サムネイル画像 */}
			<Image
				src={thumbnailUrl}
				alt={alt}
				h="full"
				w="full"
				objectFit={objectFit}
				fallback={fallbackContent}
				onError={() => {
					// エラー時のハンドリングは既にfallbackで対応
				}}
			/>

			{/* プレイボタンオーバーレイ */}
			<Box
				className="overlay"
				position="absolute"
				top="0"
				left="0"
				right="0"
				bottom="0"
				bg={overlayBg}
				display="flex"
				alignItems="center"
				justifyContent="center"
				opacity={0.7}
				transition="opacity 0.2s"
			>
				<Box
					position="relative"
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					{/* YouTube風のプレイボタン */}
					<Box
						w="60px"
						h="42px"
						bg="red.600"
						borderRadius="8px"
						display="flex"
						alignItems="center"
						justifyContent="center"
						boxShadow="0 4px 8px rgba(0,0,0,0.3)"
						_hover={{
							bg: "red.700",
							transform: "scale(1.05)",
						}}
						transition="all 0.2s"
					>
						<Icon
							as={FaPlay}
							color={iconColor}
							boxSize={5}
							ml="2px" // プレイアイコンの視覚的センタリング調整
						/>
					</Box>
					{/* Shortsラベル（YouTube Shortsの場合） */}
					{url?.includes("/shorts/") && (
						<Box
							position="absolute"
							bottom="-50px"
							left="50%"
							transform="translateX(-50%)"
							bg="blackAlpha.800"
							color="white"
							px={3}
							py={1}
							borderRadius="full"
							fontSize="xs"
							fontWeight="bold"
							textTransform="uppercase"
							letterSpacing="wide"
						>
							Shorts
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default YouTubeThumbnail;
