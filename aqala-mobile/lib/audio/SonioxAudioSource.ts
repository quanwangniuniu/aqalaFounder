import type { AudioSource, AudioSourceHandlers } from "@soniox/client";
import {
  requireNativeModule,
  LegacyEventEmitter,
  type EventSubscription,
} from "expo-modules-core";
import { decode as base64Decode } from "./base64";

const SAMPLE_RATE = 16000;
const CHANNELS = 1;
const INTERVAL_MS = 100;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _nativeModule: any = null;
let _emitter: LegacyEventEmitter | null = null;

function getNativeModule() {
  if (!_nativeModule) {
    _nativeModule = requireNativeModule("AudioStudio");
    _emitter = new LegacyEventEmitter(_nativeModule);
  }
  return { module: _nativeModule, emitter: _emitter! };
}

/**
 * Bridges @siteed/audio-studio native PCM recording into the Soniox
 * AudioSource interface so useRecording() can consume device mic audio.
 *
 * Records 16 kHz / mono / pcm_16bit and delivers raw Int16 ArrayBuffers.
 *
 * The native module is loaded lazily on first start() call so that
 * importing this file doesn't crash in Expo Go.
 */
export class SonioxAudioSource implements AudioSource {
  private subscription: EventSubscription | null = null;
  private recording = false;

  async start(handlers: AudioSourceHandlers): Promise<void> {
    const { module: AudioStudio, emitter } = getNativeModule();

    this.subscription = emitter.addListener("AudioData", (event: any) => {
      try {
        const { encoded, pcmFloat32 } = event;

        if (pcmFloat32 != null) {
          const f32 =
            pcmFloat32 instanceof Float32Array
              ? pcmFloat32
              : new Float32Array(pcmFloat32 as number[]);
          const i16 = new Int16Array(f32.length);
          for (let i = 0; i < f32.length; i++) {
            const s = Math.max(-1, Math.min(1, f32[i]));
            i16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          handlers.onData(i16.buffer as ArrayBuffer);
        } else if (encoded) {
          const bytes = base64Decode(encoded);
          handlers.onData(bytes);
        }
      } catch (err) {
        handlers.onError(
          err instanceof Error ? err : new Error(String(err)),
        );
      }
    });

    await AudioStudio.startRecording({
      sampleRate: SAMPLE_RATE,
      channels: CHANNELS,
      encoding: "pcm_16bit",
      interval: INTERVAL_MS,
      keepAwake: true,
      enableProcessing: false,
    });
    this.recording = true;
  }

  stop(): void {
    this.subscription?.remove();
    this.subscription = null;

    if (!_nativeModule || !this.recording) return;
    this.recording = false;

    try {
      _nativeModule.stopRecording();
    } catch {
      // safe to ignore if already stopped
    }
  }
}
