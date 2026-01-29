import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Generic type for socket event data
interface SocketEventData {
  rideId?: string;
  driverId?: string;
  status?: string;
  [key: string]: unknown;
}

type SocketCallback = (data: SocketEventData) => void;

class SocketService {
  private socket: Socket | null = null;
  private tenantId: string = DEFAULT_TENANT_ID;
  private listeners: Map<string, Set<SocketCallback>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${WS_URL}/rides`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Listen for generic updates
    this.socket.on('update', (data) => {
      this.notifyListeners('update', data);
    });

    // Listen for specific events
    const events = [
      'driver_assigned',
      'driver_arrived',
      'trip_started',
      'completed',
      'cancelled',
      'no_drivers',
      'offer',
    ];

    events.forEach((event) => {
      this.socket?.on(event, (data) => {
        this.notifyListeners(event, data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Subscribe to ride updates
  subscribeToRide(rideId: string, callback: SocketCallback) {
    if (!this.socket?.connected) {
      this.connect();
    }

    this.socket?.emit('subscribe:ride', {
      tenantId: this.tenantId,
      rideId,
    });

    // Add listener for this ride's events
    this.addListener(`ride:${rideId}`, callback);

    return () => {
      this.unsubscribeFromRide(rideId);
      this.removeListener(`ride:${rideId}`, callback);
    };
  }

  unsubscribeFromRide(rideId: string) {
    this.socket?.emit('unsubscribe:ride', {
      tenantId: this.tenantId,
      rideId,
    });
  }

  // Subscribe to driver updates (for driver app)
  subscribeToDriver(driverId: string, callback: SocketCallback) {
    if (!this.socket?.connected) {
      this.connect();
    }

    this.socket?.emit('subscribe:driver', {
      tenantId: this.tenantId,
      driverId,
    });

    this.addListener(`driver:${driverId}`, callback);

    return () => {
      this.removeListener(`driver:${driverId}`, callback);
    };
  }

  // Subscribe to driver location (for tracking)
  subscribeToDriverLocation(driverId: string, callback: SocketCallback) {
    if (!this.socket?.connected) {
      this.connect();
    }

    this.socket?.emit('subscribe:driver_location', {
      tenantId: this.tenantId,
      driverId,
    });

    this.addListener(`driver_location:${driverId}`, callback);

    return () => {
      this.removeListener(`driver_location:${driverId}`, callback);
    };
  }

  // Add event listener
  on(event: string, callback: SocketCallback) {
    this.addListener(event, callback);
    return () => this.removeListener(event, callback);
  }

  private addListener(event: string, callback: SocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  private removeListener(event: string, callback: SocketCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private notifyListeners(event: string, data: SocketEventData) {
    // Notify direct listeners
    this.listeners.get(event)?.forEach((callback) => callback(data));

    // Notify ride-specific listeners
    if (data.rideId) {
      this.listeners.get(`ride:${data.rideId}`)?.forEach((callback) => callback(data));
    }

    // Notify driver-specific listeners
    if (data.driverId) {
      this.listeners.get(`driver:${data.driverId}`)?.forEach((callback) => callback(data));
      this.listeners.get(`driver_location:${data.driverId}`)?.forEach((callback) => callback(data));
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Ping for connection health check
  ping(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      const start = Date.now();
      this.socket.emit('ping', {}, (response: { event?: string }) => {
        if (response.event === 'pong') {
          resolve(Date.now() - start);
        } else {
          reject(new Error('Invalid pong response'));
        }
      });
    });
  }
}

export const socketService = new SocketService();
export default socketService;
