import { createAxiosClient } from "../infrastructure/AxiosClient";

export class ChatVoice {
	private audio: HTMLAudioElement | null = null;
	private audioUrl: string | null = null;

	constructor(
		public text: string,
		public audioBlob: Blob,
		public characterId: string,
	) {}

	async play(): Promise<void> {
		// Blobが有効かチェック
		if (!this.audioBlob || this.audioBlob.size === 0) {
			throw new Error("音声データが無効です");
		}

		return new Promise((resolve, reject) => {
			try {
				this.audioUrl = URL.createObjectURL(this.audioBlob);
				this.audio = new Audio(this.audioUrl);

				this.audio.onended = () => {
					this.cleanup();
					resolve();
				};

				this.audio.onerror = (error) => {
					this.cleanup();
					console.error("音声再生中にエラーが発生しました:", error);
					reject(
						new Error(
							`音声再生に失敗しました: ${this.audio?.error?.message || "不明なエラー"}`,
						),
					);
				};

				this.audio.onabort = () => {
					this.cleanup();
					reject(new Error("音声再生が中断されました"));
				};

				this.audio
					.play()
					.then(() => {
						// 再生開始成功
					})
					.catch((playError) => {
						this.cleanup();
						reject(playError);
					});
			} catch (error) {
				this.cleanup();
				reject(error);
			}
		});
	}

	pause(): void {
		if (this.audio && !this.audio.paused) {
			this.audio.pause();
		}
	}

	resume(): void {
		if (this.audio?.paused) {
			this.audio.play().catch((error) => {
				console.error("音声再生の再開に失敗しました:", error);
			});
		}
	}

	stop(): void {
		if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
		}
		this.cleanup();
	}

	isPlaying(): boolean {
		return this.audio ? !this.audio.paused : false;
	}

	isPaused(): boolean {
		return this.audio ? this.audio.paused : false;
	}

	getCurrentTime(): number {
		return this.audio?.currentTime || 0;
	}

	getDuration(): number {
		return this.audio?.duration || 0;
	}

	private cleanup(): void {
		if (this.audioUrl) {
			URL.revokeObjectURL(this.audioUrl);
			this.audioUrl = null;
		}
		this.audio = null;
	}

	download(filename?: string): void {
		const audioUrl = URL.createObjectURL(this.audioBlob);
		const link = document.createElement("a");
		link.href = audioUrl;
		link.download = filename || `voice_${this.characterId}_${Date.now()}.mp3`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(audioUrl);
	}

	createObjectURL(): string {
		return URL.createObjectURL(this.audioBlob);
	}
}

interface VoiceResponse extends Blob {}

interface ChatVoiceRequest {
	text: string;
}

function createChatVoice(
	text: string,
	audioBlob: Blob,
	characterId: string,
): ChatVoice {
	return new ChatVoice(text, audioBlob, characterId);
}

export async function generateVoice(
	characterId: string,
	text: string,
): Promise<ChatVoice> {
	const client = createAxiosClient();
	const response = await client.postBlob<ChatVoiceRequest, VoiceResponse>(
		"/recipes/process/voice_reader",
		{ text: text },
	);
	return createChatVoice(text, response.data, characterId);
}
