import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Lead, ConnectionStatus, SystemActivityLog, LeadStatus, AppMode } from '../types/lead';
import { Platform } from 'react-native';

const DEFAULT_BACKEND_URL =
  Platform.OS === 'web'
    ? 'http://localhost:4000'
    : 'https://innovative-journalist-lime-york.trycloudflare.com';

export function useRealtimeLeads(customServerUrl?: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [serverUrl, setServerUrl] = useState<string>(customServerUrl || DEFAULT_BACKEND_URL);
  const [latestLead, setLatestLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<SystemActivityLog[]>([]);
  const [appMode, setAppMode] = useState<AppMode>('demo');

  const socketRef = useRef<Socket | null>(null);
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const connectSocket = useCallback((url: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setConnectionStatus('connecting');
    console.log(`[SocketHook] 🔄 Connecting to WebSocket server: ${url}`);

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 30,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log(`[SocketHook] 🟢 Connected to server (Socket ID: ${socket.id})`);
      setConnectionStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log(`[SocketHook] 🔴 Disconnected from server: ${reason}`);
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.warn(`[SocketHook] ⚠️ Connection Error:`, error.message);
      setConnectionStatus('disconnected');
    });

    // Activity History Initial Sync
    socket.on('activity_history', (history: SystemActivityLog[]) => {
      setActivities(history);
    });

    // Real-time Activity Stream
    socket.on('system_activity', (activity: SystemActivityLog) => {
      setActivities((prev) => [activity, ...prev.slice(0, 40)]);
    });

    // Cross-Client Status Update Listener
    socket.on('lead_status_updated', (data: { leadId: string; status: LeadStatus; contactedAt?: string; responseTimeSeconds?: number }) => {
      setLeads((currentLeads) =>
        currentLeads.map((item) =>
          item.id === data.leadId
            ? {
                ...item,
                status: data.status,
                contacted_at: data.contactedAt || item.contacted_at,
                response_time_seconds: data.responseTimeSeconds !== undefined ? data.responseTimeSeconds : item.response_time_seconds,
              }
            : item
        )
      );
    });

    // Real-time Lead Event Listener
    socket.on('new_lead', (newLead: Lead) => {
      console.log(`[SocketHook] ⚡ Received live lead:`, newLead.full_name);
      
      const leadWithFlags: Lead = {
        ...newLead,
        status: newLead.status || 'new',
        isNew: true,
        showTrace: true,
      };

      setLatestLead(leadWithFlags);

      setLeads((prev) => {
        // Deduplicate incoming leads by leadgen_id
        const filtered = prev.filter((item) => item.leadgen_id !== leadWithFlags.leadgen_id);
        return [leadWithFlags, ...filtered];
      });

      // Clear the latest alert toast after 6 seconds
      const toastTimer = setTimeout(() => {
        setLatestLead((current) => (current?.id === leadWithFlags.id ? null : current));
        timersRef.current.delete(toastTimer);
      }, 6000);
      timersRef.current.add(toastTimer);

      // Dismiss the delivery trace animation after 4 seconds
      const t1 = setTimeout(() => {
        setLeads((currentLeads) =>
          currentLeads.map((item) =>
            item.id === leadWithFlags.id ? { ...item, showTrace: false } : item
          )
        );
        timersRef.current.delete(t1);
      }, 4000);
      timersRef.current.add(t1);

      // Dismiss the "isNew" glowing border after 15 seconds
      const t2 = setTimeout(() => {
        setLeads((currentLeads) =>
          currentLeads.map((item) =>
            item.id === leadWithFlags.id ? { ...item, isNew: false } : item
          )
        );
        timersRef.current.delete(t2);
      }, 15000);
      timersRef.current.add(t2);
    });

    socketRef.current = socket;
  }, []);

  useEffect(() => {
    connectSocket(serverUrl);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [serverUrl, connectSocket]);

  /**
   * Updates lead status (New -> Contacted -> Qualified -> Closed)
   * Automatically calculates response speed in seconds
   */
  const updateLeadStatus = useCallback((leadId: string, newStatus: LeadStatus) => {
    setLeads((prevLeads) => {
      return prevLeads.map((lead) => {
        if (lead.id === leadId) {
          let contactedAt = lead.contacted_at;
          let responseTimeSeconds = lead.response_time_seconds;

          // If transitioning to contacted for the first time, compute response time
          if (newStatus === 'contacted' && !lead.contacted_at) {
            contactedAt = new Date().toISOString();
            const receivedTime = new Date(lead.received_at || lead.created_time).getTime();
            const now = Date.now();
            responseTimeSeconds = Math.max(1, Math.round((now - receivedTime) / 1000));
          }

          const updatedLead: Lead = {
            ...lead,
            status: newStatus,
            contacted_at: contactedAt,
            response_time_seconds: responseTimeSeconds,
          };

          // Broadcast to socket server
          if (socketRef.current) {
            socketRef.current.emit('update_lead_status', {
              leadId,
              status: newStatus,
              contactedAt,
              responseTimeSeconds,
            });
          }

          return updatedLead;
        }
        return lead;
      });
    });
  }, []);

  /**
   * Updates lead notes / remarks
   */
  const updateLeadNotes = useCallback((leadId: string, notes: string) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead.id === leadId ? { ...lead, notes } : lead))
    );
  }, []);

  const triggerMockLead = async () => {
    try {
      console.log(`[SocketHook] 🧪 Requesting simulation from: ${serverUrl}/api/simulate-lead`);
      const response = await fetch(`${serverUrl}/api/simulate-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Simulated from Mobile Developer Control' }),
      });
      return await response.json();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[SocketHook] ❌ Failed to simulate lead:', error.message);
      throw error;
    }
  };

  const clearLeads = () => {
    setLeads([]);
    setLatestLead(null);
  };

  return {
    leads,
    connectionStatus,
    serverUrl,
    setServerUrl,
    latestLead,
    dismissLatestLead: () => setLatestLead(null),
    activities,
    appMode,
    setAppMode,
    updateLeadStatus,
    updateLeadNotes,
    triggerMockLead,
    clearLeads,
    reconnect: () => connectSocket(serverUrl),
  };
}
