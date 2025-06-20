import { useCallback, useEffect, useRef, useState } from "react";

// PCM 16bit リトルエンディアン形式に変換する関数
function convertToPCM16(audioBuffer: AudioBuffer): ArrayBuffer {
	const length = audioBuffer.length;
	const channels = audioBuffer.numberOfChannels;

	// モノラルの場合とステレオの場合を処理
	let samples: Float32Array;
	if (channels === 1) {
		samples = audioBuffer.getChannelData(0);
	} else {
		// ステレオをモノラルに変換（平均を取る）
		const left = audioBuffer.getChannelData(0);
		const right = audioBuffer.getChannelData(1);
		samples = new Float32Array(length);
		for (let i = 0; i < length; i++) {
			samples[i] = (left[i] + right[i]) / 2;
		}
	}

	// Float32をPCM 16bitに変換
	const pcmBuffer = new ArrayBuffer(length * 2); // 16bit = 2 bytes
	const view = new DataView(pcmBuffer);

	for (let i = 0; i < length; i++) {
		// Float32 (-1.0 to 1.0) を 16bit signed integer (-32768 to 32767) に変換
		const sample = Math.max(-1, Math.min(1, samples[i]));
		const pcmSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;

		// リトルエンディアンで書き込み
		view.setInt16(i * 2, pcmSample, true);
	}

	return pcmBuffer;
}

export interface VoiceRecorderOptions {
	onDataAvailable?: (audioData: ArrayBuffer) => void;
	silenceThreshold?: number; // 無音判定の閾値 (0-255)
	silenceTimeout?: number; // 無音が続いた時の停止までの時間 (ms)
	minRecordingTime?: number; // 最小録音時間 (ms)
}

export interface VoiceRecorderState {
	isRecording: boolean;
	isListening: boolean;
	volume: number;
	error: string | null;
}

export function useVoiceRecorder({
	onDataAvailable,
	silenceThreshold = 30,
	silenceTimeout = 2000,
	minRecordingTime = 500,
}: VoiceRecorderOptions = {}) {
	const [state, setState] = useState<VoiceRecorderState>({
		isRecording: false,
		isListening: false,
		volume: 0,
		error: null,
	});

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const volumeCheckIntervalRef = useRef<number | null>(null);
	const silenceTimerRef = useRef<number | null>(null);
	const recordingStartTimeRef = useRef<number>(0);
	const isRecordingRef = useRef<boolean>(false);

	// 音量を監視してレコーディングの開始・停止を制御
	const checkVolume = useCallback(() => {
		if (!analyserRef.current) return;

		const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
		analyserRef.current.getByteFrequencyData(dataArray);

		// 平均音量を計算
		const average =
			dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

		setState((prev) => ({ ...prev, volume: average }));

		// 音声検出ロジック
		if (average > silenceThreshold) {
			// 音声が検出された
			if (!isRecordingRef.current) {
				// 録音開始
				startRecording();
			}

			// 無音タイマーをクリア
			if (silenceTimerRef.current) {
				clearTimeout(silenceTimerRef.current);
				silenceTimerRef.current = null;
			}
		} else {
			// 無音状態
			if (isRecordingRef.current && !silenceTimerRef.current) {
				// 無音タイマーを開始
				silenceTimerRef.current = window.setTimeout(() => {
					const recordingDuration = Date.now() - recordingStartTimeRef.current;
					if (recordingDuration >= minRecordingTime) {
						stopRecording();
					}
					silenceTimerRef.current = null;
				}, silenceTimeout);
			}
		}
	}, [silenceThreshold, silenceTimeout, minRecordingTime]);

	// 録音開始
	const startRecording = useCallback(() => {
		if (!mediaRecorderRef.current || isRecordingRef.current) return;

		try {
			recordingStartTimeRef.current = Date.now();
			isRecordingRef.current = true;

			setState((prev) => ({ ...prev, isRecording: true, error: null }));
			mediaRecorderRef.current.start();
		} catch (error) {
			console.error("録音開始エラー:", error);
			setState((prev) => ({
				...prev,
				error:
					error instanceof Error ? error.message : "録音開始に失敗しました",
			}));
		}
	}, []);

	// 録音停止
	const stopRecording = useCallback(() => {
		if (!mediaRecorderRef.current || !isRecordingRef.current) return;

		try {
			isRecordingRef.current = false;
			setState((prev) => ({ ...prev, isRecording: false }));
			mediaRecorderRef.current.stop();
		} catch (error) {
			console.error("録音停止エラー:", error);
			setState((prev) => ({
				...prev,
				error:
					error instanceof Error ? error.message : "録音停止に失敗しました",
			}));
		}
	}, []);

	// リスニング開始
	const startListening = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, error: null }));

			// マイクへのアクセス許可を取得
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					sampleRate: 16000,
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
			});

			streamRef.current = stream;

			// AudioContextを作成
			const audioContext = new AudioContext({ sampleRate: 16000 });
			audioContextRef.current = audioContext;

			// AnalyserNodeを作成
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			analyserRef.current = analyser;

			// マイクの音声をAnalyserに接続
			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser); // MediaRecorderを作成
			let mediaRecorder: MediaRecorder;
			try {
				// まずPCM形式を試す
				if (MediaRecorder.isTypeSupported("audio/webm;codecs=pcm")) {
					mediaRecorder = new MediaRecorder(stream, {
						mimeType: "audio/webm;codecs=pcm",
					});
				} else if (MediaRecorder.isTypeSupported("audio/wav")) {
					mediaRecorder = new MediaRecorder(stream, {
						mimeType: "audio/wav",
					});
				} else {
					// フォールバック
					mediaRecorder = new MediaRecorder(stream);
				}
			} catch {
				// 最終フォールバック
				mediaRecorder = new MediaRecorder(stream);
			}
			mediaRecorder.ondataavailable = async (event) => {
				if (event.data.size > 0 && onDataAvailable) {
					try {
						const buffer = await event.data.arrayBuffer();

						// 可能であればPCM形式に変換
						if (audioContextRef.current) {
							try {
								const audioBuffer =
									await audioContextRef.current.decodeAudioData(
										buffer.slice(0),
									);

								// PCM 16bit リトルエンディアン形式に変換
								const pcmData = convertToPCM16(audioBuffer);
								onDataAvailable(pcmData);
							} catch (decodeError) {
								console.warn("PCM変換に失敗、元データを送信:", decodeError);
								onDataAvailable(buffer);
							}
						} else {
							onDataAvailable(buffer);
						}
					} catch (error) {
						console.error("音声データ処理エラー:", error);
					}
				}
			};

			mediaRecorder.onerror = (event) => {
				console.error("MediaRecorder エラー:", event);
				setState((prev) => ({
					...prev,
					error: "録音中にエラーが発生しました",
				}));
			};

			mediaRecorderRef.current = mediaRecorder;

			// 音量監視を開始
			volumeCheckIntervalRef.current = window.setInterval(checkVolume, 100);

			setState((prev) => ({ ...prev, isListening: true }));
		} catch (error) {
			console.error("マイクアクセスエラー:", error);
			setState((prev) => ({
				...prev,
				error:
					error instanceof Error
						? error.message
						: "マイクにアクセスできませんでした",
			}));
		}
	}, [onDataAvailable, checkVolume]);

	// リスニング停止
	const stopListening = useCallback(() => {
		// 録音停止
		if (isRecordingRef.current) {
			stopRecording();
		}

		// タイマーをクリア
		if (volumeCheckIntervalRef.current) {
			clearInterval(volumeCheckIntervalRef.current);
			volumeCheckIntervalRef.current = null;
		}

		if (silenceTimerRef.current) {
			clearTimeout(silenceTimerRef.current);
			silenceTimerRef.current = null;
		}

		// AudioContextを停止
		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}

		// ストリームを停止
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}

		// 参照をクリア
		mediaRecorderRef.current = null;
		analyserRef.current = null;
		isRecordingRef.current = false;

		setState((prev) => ({
			...prev,
			isListening: false,
			isRecording: false,
			volume: 0,
		}));
	}, [stopRecording]);

	// コンポーネントアンマウント時のクリーンアップ
	useEffect(() => {
		return () => {
			stopListening();
		};
	}, [stopListening]);

	return {
		...state,
		startListening,
		stopListening,
	};
}
