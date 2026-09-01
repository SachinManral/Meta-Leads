import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Lead, ConnectionStatus, SystemActivityLog, LeadStatus, AppMode } from '../types/lead';
import { Platform, Vibration } from 'react-native';

const DEFAULT_BACKEND_URL =
  Platform.OS === 'web'
    ? 'http://localhost:4000'
    : 'https://troy-allowed-fan-calendars.trycloudflare.com';

export function useRealtimeLeads(customServerUrl?: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [serverUrl, setServerUrl] = useState<string>(customServerUrl || DEFAULT_BACKEND_URL);
  const [latestLead, setLatestLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<SystemActivityLog[]>([]);
  const [appMode, setAppMode] = useState<AppMode>('demo');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const connectSocket = useCallback((url: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setConnectionStatus('connecting');
    console.log(`[SocketHook] Connecting to ${url}`);

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 30,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log(`[SocketHook] Connected (id: ${socket.id})`);
      setConnectionStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log(`[SocketHook] Disconnected: ${reason}`);
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.warn(`[SocketHook] Connection error:`, error.message);
      setConnectionStatus('disconnected');
    });

    socket.on('initial_leads', (initialLeads: Lead[]) => {
      console.log(`[SocketHook] Received ${initialLeads.length} initial leads`);
      setLeads(initialLeads);
    });

    socket.on('activity_history', (history: SystemActivityLog[]) => {
      setActivities(history);
    });

    socket.on('system_activity', (activity: SystemActivityLog) => {
      setActivities((prev) => [activity, ...prev.slice(0, 40)]);
    });

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

    socket.on('lead_notes_updated', (data: { leadId: string; notes: string }) => {
      setLeads((currentLeads) =>
        currentLeads.map((item) =>
          item.id === data.leadId ? { ...item, notes: data.notes } : item
        )
      );
    });

    socket.on('new_lead', (newLead: Lead) => {
      console.log(`[SocketHook] Received lead:`, newLead.full_name);

      if (Platform.OS !== 'web') {
        try {
          Vibration.vibrate([0, 90, 40, 90]);
        } catch {
          // Ignore vibration error if not supported
        }
      }
      
      const leadWithFlags: Lead = {
        ...newLead,
        status: newLead.status || 'new',
        isNew: true,
        showTrace: true,
      };

      setLatestLead(leadWithFlags);

      setLeads((prev) => {
        const isSample = leadWithFlags.leadgen_id === '444444444444';
        const filtered = prev.filter((item) => {
          if (item.id === leadWithFlags.id) return false;
          if (!isSample && item.leadgen_id === leadWithFlags.leadgen_id) return false;
          return true;
        });
        return [leadWithFlags, ...filtered];
      });

      const toastTimer = setTimeout(() => {
        setLatestLead((current) => (current?.id === leadWithFlags.id ? null : current));
        timersRef.current.delete(toastTimer);
      }, 6000);
      timersRef.current.add(toastTimer);

      const t1 = setTimeout(() => {
        setLeads((currentLeads) =>
          currentLeads.map((item) =>
            item.id === leadWithFlags.id ? { ...item, showTrace: false } : item
          )
        );
        timersRef.current.delete(t1);
      }, 4000);
      timersRef.current.add(t1);

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

  const updateLeadStatus = useCallback((leadId: string, newStatus: LeadStatus) => {
    setLeads((prevLeads) => {
      return prevLeads.map((lead) => {
        if (lead.id === leadId) {
          let contactedAt = lead.contacted_at;
          let responseTimeSeconds = lead.response_time_seconds;

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

  const updateLeadNotes = useCallback((leadId: string, notes: string) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead.id === leadId ? { ...lead, notes } : lead))
    );

    if (socketRef.current) {
      socketRef.current.emit('update_lead_notes', { leadId, notes });
    }

    // Fallback sync via REST
    fetch(`${serverUrl}/api/leads/${leadId}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    }).catch((err) => console.warn('[SocketHook] Note sync error:', err.message));
  }, [serverUrl]);

  const refreshLeads = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${serverUrl}/api/leads`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      }
    } catch (err: unknown) {
      console.warn('[SocketHook] Refresh leads failed:', (err as Error).message);
    } finally {
      setIsRefreshing(false);
    }
  }, [serverUrl]);

  const triggerMockLead = async () => {
    try {
      console.log(`[SocketHook] Requesting simulation from: ${serverUrl}/api/simulate-lead`);
      const response = await fetch(`${serverUrl}/api/simulate-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Simulated from Mobile Developer Control' }),
      });
      return await response.json();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[SocketHook] Simulation failed:', error.message);
      throw error;
    }
  };

  const clearLeads = useCallback(async () => {
    setLeads([]);
    setLatestLead(null);
    try {
      await fetch(`${serverUrl}/api/leads`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[SocketHook] Clear leads error:', err);
    }
  }, [serverUrl]);

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
    isRefreshing,
    refreshLeads,
    updateLeadStatus,
    updateLeadNotes,
    triggerMockLead,
    clearLeads,
    reconnect: () => connectSocket(serverUrl),
  };
}
