"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  LocalAudioTrack,
  createLocalAudioTrack,
  ConnectionState,
  DisconnectReason,
} from "livekit-client";

export interface BroadcastMessage {
  type: "translation" | "source";
  text: string;
  partial?: string;
  lang?: string;
  timestamp: number;
}

interface UseLiveKitBroadcastOptions {
  roomName: string;
  participantName: string;
  isPublisher: boolean;
  onMessage?: (message: BroadcastMessage) => void;
  onParticipantCount?: (count: number) => void;
  onConnectionChange?: (connected: boolean) => void;
  onAudioStateChange?: (hasAudio: boolean) => void;
}

export function useLiveKitBroadcast({
  roomName,
  participantName,
  isPublisher,
  onMessage,
  onParticipantCount,
  onConnectionChange,
  onAudioStateChange,
}: UseLiveKitBroadcastOptions) {
  const roomRef = useRef<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasRemoteAudio, setHasRemoteAudio] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);
  const intentionalDisconnectRef = useRef(false);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);
  const connectingRef = useRef(false);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Refs for callbacks to avoid re-connection issues
  const onMessageRef = useRef(onMessage);
  const onParticipantCountRef = useRef(onParticipantCount);
  const onConnectionChangeRef = useRef(onConnectionChange);
  const onAudioStateChangeRef = useRef(onAudioStateChange);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onParticipantCountRef.current = onParticipantCount;
    onConnectionChangeRef.current = onConnectionChange;
    onAudioStateChangeRef.current = onAudioStateChange;
  }, [onMessage, onParticipantCount, onConnectionChange, onAudioStateChange]);

  // Helper to update participant count
  const updateParticipantCount = useCallback((room: Room) => {
    const count = room.remoteParticipants.size;
    setParticipantCount(count);
    onParticipantCountRef.current?.(count);
  }, []);

  // Connect to the room
  const connect = useCallback(async () => {
    // Prevent duplicate connections
    if (connectingRef.current) return;
    if (roomRef.current?.state === ConnectionState.Connected) return;

    connectingRef.current = true;
    intentionalDisconnectRef.current = false;

    try {
      setError(null);
      setDisconnectReason(null);

      // Get token from API
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          participantName,
          isPublisher,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get token");
      }

      // Clean up any existing room
      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }

      // Create and connect to room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        // Don't auto-subscribe to own tracks to prevent echo
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      roomRef.current = room;

      // Set up event handlers
      room.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        onConnectionChangeRef.current?.(true);
        updateParticipantCount(room);
      });

      room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        setIsConnected(false);
        setHasRemoteAudio(false);
        onConnectionChangeRef.current?.(false);
        onAudioStateChangeRef.current?.(false);
        // Clean up audio elements
        audioElementsRef.current.forEach((el) => el.remove());
        audioElementsRef.current.clear();
        
        // Only show error for unexpected disconnects
        if (!intentionalDisconnectRef.current && reason !== DisconnectReason.CLIENT_INITIATED) {
          const reasonText = reason === DisconnectReason.SERVER_SHUTDOWN 
            ? "Server closed the connection"
            : reason === DisconnectReason.PARTICIPANT_REMOVED
            ? "You were removed from the session"
            : reason === DisconnectReason.ROOM_DELETED
            ? "The session has ended"
            : reason === DisconnectReason.DUPLICATE_IDENTITY
            ? "Connected from another device"
            : "Connection lost";
          setDisconnectReason(reasonText);
        }
        intentionalDisconnectRef.current = false;
      });

      room.on(RoomEvent.ParticipantConnected, () => {
        updateParticipantCount(room);
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        updateParticipantCount(room);
      });

      room.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const decoder = new TextDecoder();
          const message = JSON.parse(decoder.decode(payload)) as BroadcastMessage;
          console.log("[LiveKit] Data received from", participant?.identity, ":", message);
          onMessageRef.current?.(message);
        } catch (e) {
          console.error("[LiveKit] Failed to parse message:", e);
        }
      });

      // Handle incoming audio tracks - only from REMOTE participants (prevents echo)
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          // IMPORTANT: Only attach audio from remote participants, not our own
          // This prevents the broadcaster from hearing their own voice (echo)
          if (participant instanceof RemoteParticipant) {
            const audioElement = track.attach();
            audioElement.id = `audio-${participant.identity}`;
            audioElement.volume = 1.0;
            document.body.appendChild(audioElement);
            audioElementsRef.current.set(participant.identity, audioElement);
            setHasRemoteAudio(true);
            onAudioStateChangeRef.current?.(true);
          }
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio && participant instanceof RemoteParticipant) {
          track.detach().forEach((el) => el.remove());
          audioElementsRef.current.delete(participant.identity);
          // Check if any remote audio remains
          if (audioElementsRef.current.size === 0) {
            setHasRemoteAudio(false);
            onAudioStateChangeRef.current?.(false);
          }
        }
      });

      await room.connect(data.url, data.token);
    } catch (e: any) {
      setError(e?.message || "Failed to connect");
      console.error("LiveKit connection error:", e);
    } finally {
      connectingRef.current = false;
    }
  }, [roomName, participantName, isPublisher, updateParticipantCount]);

  // Disconnect from the room
  const disconnect = useCallback(async () => {
    intentionalDisconnectRef.current = true;
    if (audioTrackRef.current) {
      audioTrackRef.current.stop();
      audioTrackRef.current = null;
    }
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setIsAudioEnabled(false);
    setDisconnectReason(null);
  }, []);

  // Enable/disable audio publishing (for broadcaster)
  const toggleAudio = useCallback(async () => {
    if (!roomRef.current || !isPublisher) return;

    try {
      if (isAudioEnabled) {
        // Disable audio
        if (audioTrackRef.current) {
          await roomRef.current.localParticipant.unpublishTrack(audioTrackRef.current);
          audioTrackRef.current.stop();
          audioTrackRef.current = null;
        }
        setIsAudioEnabled(false);
      } else {
        // Enable audio
        const audioTrack = await createLocalAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
        });
        audioTrackRef.current = audioTrack;
        await roomRef.current.localParticipant.publishTrack(audioTrack);
        setIsAudioEnabled(true);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to toggle audio");
      console.error("Audio toggle error:", e);
    }
  }, [isPublisher, isAudioEnabled]);

  // Send a data message (for broadcaster)
  const sendMessage = useCallback(
    async (message: BroadcastMessage) => {
      console.log("[LiveKit] sendMessage called:", { hasRoom: !!roomRef.current, isPublisher, message });
      if (!roomRef.current || !isPublisher) {
        console.warn("[LiveKit] Cannot send - room:", !!roomRef.current, "isPublisher:", isPublisher);
        return;
      }

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(message));
        await roomRef.current.localParticipant.publishData(
          data,
          { reliable: true }
        );
        console.log("[LiveKit] Message published successfully");
      } catch (e: any) {
        console.error("[LiveKit] Failed to send message:", e);
      }
    },
    [isPublisher]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Clear disconnect reason
  const clearDisconnectReason = useCallback(() => {
    setDisconnectReason(null);
  }, []);

  return {
    connect,
    disconnect,
    toggleAudio,
    sendMessage,
    isConnected,
    isAudioEnabled,
    participantCount,
    hasRemoteAudio,
    error,
    disconnectReason,
    clearDisconnectReason,
  };
}
