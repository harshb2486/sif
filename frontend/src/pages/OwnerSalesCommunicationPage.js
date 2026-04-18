import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Header, Sidebar } from '../components';
import { useAuth } from '../context/AuthContext';
import { ownerSalesChatAPI } from '../services/api';
import { connectRealtimeSocket, disconnectRealtimeSocket, getRealtimeSocket } from '../services/realtimeSocket';
import './Pages.css';

const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export const OwnerSalesCommunicationPage = () => {
  const { user, token } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [error, setError] = useState('');

  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedContactIdRef = useRef(null);
  const activeCallTypeRef = useRef(null);
  const incomingCallTypeRef = useRef(null);

  const selectedContactId = selectedContact?.id;

  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
  }, [selectedContactId]);

  useEffect(() => {
    activeCallTypeRef.current = activeCall?.callType || null;
  }, [activeCall?.callType]);

  useEffect(() => {
    incomingCallTypeRef.current = incomingCall?.callType || null;
  }, [incomingCall?.callType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const contactsResponse = await ownerSalesChatAPI.getContacts();
        const list = contactsResponse?.data?.data || [];
        setContacts(list);
        if (list.length > 0) {
          setSelectedContact(list[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load contacts for communication');
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!selectedContactId) return;

    const loadMessages = async () => {
      try {
        const response = await ownerSalesChatAPI.getMessagesByContact(selectedContactId, 100);
        setMessages(response?.data?.data?.messages || []);
      } catch (err) {
        setError('Failed to load chat messages');
      }
    };

    loadMessages();
  }, [selectedContactId]);

  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setActiveCall(null);
  };

  const ensureLocalMedia = async (callType) => {
    if (localStreamRef.current) return localStreamRef.current;

    const media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video'
    });
    localStreamRef.current = media;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = media;
    }
    return media;
  };

  const initPeerConnection = async (targetUserId, callType) => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    const peer = new RTCPeerConnection(rtcConfig);
    peerRef.current = peer;

    const localStream = await ensureLocalMedia(callType);
    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      remoteStreamRef.current = remoteStream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      const socket = getRealtimeSocket();
      socket?.emit('webrtc:ice-candidate', {
        targetUserId,
        candidate: event.candidate
      });
    };

    return peer;
  };

  useEffect(() => {
    if (!token) return;

    const socket = connectRealtimeSocket(token);

    const onPresenceUpdate = (payload = {}) => {
      setOnlineUserIds(payload.onlineUserIds || []);
    };

    const onChatNew = (payload = {}) => {
      const message = payload.message;
      if (!message) return;

      const otherUserId = message.sender_id === user?.id
        ? payload.contactUserId
        : message.sender_id;

      if (Number(otherUserId) === Number(selectedContactIdRef.current)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const onIncomingCall = (payload = {}) => {
      setIncomingCall(payload);
    };

    const onCallAccepted = async (payload = {}) => {
      try {
        const targetUserId = payload.byUserId;
        const callType = payload.callType || 'audio';
        const peer = await initPeerConnection(targetUserId, callType);

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit('webrtc:offer', {
          targetUserId,
          sdp: offer
        });
      } catch (err) {
        cleanupCall();
        setError('Failed to start WebRTC call');
      }
    };

    const onWebrtcOffer = async (payload = {}) => {
      try {
        const targetUserId = payload.fromUserId;
        const callType = activeCallTypeRef.current || incomingCallTypeRef.current || 'audio';
        const peer = await initPeerConnection(targetUserId, callType);

        await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('webrtc:answer', {
          targetUserId,
          sdp: answer
        });
      } catch (err) {
        cleanupCall();
        setError('Failed to handle incoming call offer');
      }
    };

    const onWebrtcAnswer = async (payload = {}) => {
      try {
        if (!peerRef.current) return;
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      } catch (err) {
        setError('Failed to apply call answer');
      }
    };

    const onIceCandidate = async (payload = {}) => {
      try {
        if (!peerRef.current || !payload.candidate) return;
        await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (err) {
        // Ignore individual ICE candidate errors
      }
    };

    const onCallEnded = () => cleanupCall();
    const onCallRejected = () => {
      cleanupCall();
      setError('Call was rejected');
    };

    socket.on('presence:update', onPresenceUpdate);
    socket.on('chat:new', onChatNew);
    socket.on('call:incoming', onIncomingCall);
    socket.on('call:accepted', onCallAccepted);
    socket.on('call:rejected', onCallRejected);
    socket.on('call:ended', onCallEnded);
    socket.on('webrtc:offer', onWebrtcOffer);
    socket.on('webrtc:answer', onWebrtcAnswer);
    socket.on('webrtc:ice-candidate', onIceCandidate);

    return () => {
      socket.off('presence:update', onPresenceUpdate);
      socket.off('chat:new', onChatNew);
      socket.off('call:incoming', onIncomingCall);
      socket.off('call:accepted', onCallAccepted);
      socket.off('call:rejected', onCallRejected);
      socket.off('call:ended', onCallEnded);
      socket.off('webrtc:offer', onWebrtcOffer);
      socket.off('webrtc:answer', onWebrtcAnswer);
      socket.off('webrtc:ice-candidate', onIceCandidate);
      cleanupCall();
      disconnectRealtimeSocket();
    };
  }, [token, user?.id]);

  const isContactOnline = (contactId) => onlineUserIds.includes(Number(contactId));

  const handleSendMessage = async () => {
    if (!selectedContact || !inputMessage.trim()) return;

    const socket = getRealtimeSocket();
    if (!socket) {
      setError('Realtime connection unavailable');
      return;
    }

    socket.emit(
      'chat:send',
      { contactUserId: selectedContact.id, content: inputMessage.trim() },
      (ack = {}) => {
        if (!ack.success) {
          setError(ack.message || 'Failed to send message');
        }
      }
    );

    setInputMessage('');
  };

  const startCall = (callType = 'audio') => {
    if (!selectedContact) return;

    const socket = getRealtimeSocket();
    if (!socket) {
      setError('Realtime connection unavailable');
      return;
    }

    setActiveCall({
      targetUserId: selectedContact.id,
      targetUserName: selectedContact.name,
      callType,
      direction: 'outgoing'
    });

    socket.emit(
      'call:initiate',
      { contactUserId: selectedContact.id, callType },
      (ack = {}) => {
        if (!ack.success) {
          cleanupCall();
          setError(ack.message || 'Failed to initiate call');
        }
      }
    );
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;

    const socket = getRealtimeSocket();
    const incoming = incomingCall;
    setIncomingCall(null);

    setActiveCall({
      targetUserId: incoming.fromUserId,
      targetUserName: incoming.fromUserName,
      callType: incoming.callType,
      direction: 'incoming'
    });

    try {
      await ensureLocalMedia(incoming.callType || 'audio');
      socket?.emit('call:accept', {
        targetUserId: incoming.fromUserId,
        callType: incoming.callType
      });
    } catch (err) {
      setError('Cannot access microphone/camera for the call');
      cleanupCall();
    }
  };

  const rejectIncomingCall = () => {
    if (!incomingCall) return;
    const socket = getRealtimeSocket();
    socket?.emit('call:reject', { targetUserId: incomingCall.fromUserId });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (!activeCall) return;
    const socket = getRealtimeSocket();
    socket?.emit('call:end', { targetUserId: activeCall.targetUserId });
    cleanupCall();
  };

  const contactSummary = useMemo(() => {
    if (user?.role === 'company_admin') {
      return 'Select a sales person to start realtime chat or call.';
    }
    return 'Select your company owner/admin to start realtime chat or call.';
  }, [user?.role]);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-container owner-sales-comm-page">
          <div className="page-header">
            <h1>📞 Team Communication</h1>
            <p className="page-subtitle">Realtime chat and calling between owner and sales team</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {incomingCall && (
            <div className="owner-sales-incoming-call">
              <p>
                Incoming {incomingCall.callType} call from <strong>{incomingCall.fromUserName}</strong>
              </p>
              <div>
                <button className="btn btn-primary btn-sm" onClick={acceptIncomingCall}>Accept</button>
                <button className="btn btn-sm btn-delete" onClick={rejectIncomingCall}>Reject</button>
              </div>
            </div>
          )}

          <div className="owner-sales-layout">
            <aside className="owner-sales-contacts">
              <h3>Contacts</h3>
              <p className="owner-sales-help">{contactSummary}</p>

              {contacts.length === 0 ? (
                <p className="owner-sales-empty">No contacts available.</p>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    className={`owner-sales-contact ${selectedContactId === contact.id ? 'active' : ''}`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div>
                      <strong>{contact.name}</strong>
                      <p>{contact.email}</p>
                    </div>
                    <span className={`presence-dot ${isContactOnline(contact.id) ? 'online' : 'offline'}`} />
                  </button>
                ))
              )}
            </aside>

            <section className="owner-sales-chat-panel">
              <div className="owner-sales-chat-header">
                <div>
                  <h3>{selectedContact?.name || 'Select a contact'}</h3>
                  <p>{selectedContact ? (isContactOnline(selectedContact.id) ? 'Online' : 'Offline') : 'No contact selected'}</p>
                </div>

                {selectedContact && (
                  <div className="owner-sales-call-actions">
                    <button className="btn btn-sm" onClick={() => startCall('audio')}>📞 Audio</button>
                    <button className="btn btn-sm" onClick={() => startCall('video')}>🎥 Video</button>
                    {activeCall && <button className="btn btn-sm btn-delete" onClick={endCall}>End</button>}
                  </div>
                )}
              </div>

              <div className="owner-sales-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`owner-sales-message ${Number(msg.sender_id) === Number(user?.id) ? 'mine' : 'theirs'}`}
                  >
                    <p>{msg.content}</p>
                    <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="owner-sales-input-row">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={!selectedContact}
                />
                <button className="btn btn-primary" onClick={handleSendMessage} disabled={!selectedContact}>Send</button>
              </div>

              {activeCall && (
                <div className="owner-sales-call-area">
                  <h4>
                    {activeCall.callType === 'video' ? 'Video Call' : 'Audio Call'} with {activeCall.targetUserName}
                  </h4>
                  <div className="owner-sales-videos">
                    <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                    <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
