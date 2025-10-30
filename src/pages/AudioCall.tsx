import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const STUN = [{ urls: ['stun:stun.l.google.com:19302'] }];
const SIGNAL_URL = (import.meta as any).env?.VITE_SIGNALING_URL || 'http://localhost:3001';

const AudioCall = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = params.get("conv");
  const room = useMemo(() => conversationId || "", [conversationId]);

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!room) {
      navigate('/chat');
      return;
    }

    const socket = io(SIGNAL_URL, { transports: ['websocket'], autoConnect: true });
    socketRef.current = socket;

    const pc = new RTCPeerConnection({ iceServers: STUN });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('candidate', { room, candidate: e.candidate });
    };

    socket.on('offer', async ({ sdp }) => {
      if (!pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { room, sdp: answer });
      }
    });

    socket.on('answer', async ({ sdp }) => {
      if (pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socket.on('candidate', async ({ candidate }) => {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    });

    socket.on('hangup', () => {
      endCall();
    });

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      socket.emit('join', room);
      // create offer for first peer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { room, sdp: offer });
      setConnected(true);
    })();

    return () => {
      try { socket.disconnect(); } catch {}
      try { pc.close(); } catch {}
    };
  }, [room, navigate]);

  const endCall = () => {
    if (socketRef.current) socketRef.current.emit('hangup', { room });
    if (pcRef.current) pcRef.current.close();
    setConnected(false);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Audio Call</h1>
        <div className="flex flex-col items-center gap-4">
          <audio ref={localAudioRef} autoPlay muted />
          <audio ref={remoteAudioRef} autoPlay />
        </div>
        <div className="space-x-3">
          <button onClick={endCall} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500">{connected ? 'Hang up' : 'Back'}</button>
        </div>
      </div>
    </div>
  );
};

export default AudioCall;


