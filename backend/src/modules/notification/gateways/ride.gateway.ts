import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../../shared/redis/redis.service';
import Redis from 'ioredis';

interface SubscriptionPayload {
  tenantId: string;
  rideId?: string;
  driverId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict to specific origins
    methods: ['GET', 'POST'],
  },
  namespace: '/rides',
})
export class RideGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private subscriber: Redis;
  private subscriptions: Map<string, Set<string>> = new Map(); // channel -> socket ids

  constructor(private readonly redisService: RedisService) {
    this.initializeRedisSubscriber();
  }

  private initializeRedisSubscriber() {
    this.subscriber = this.redisService.createSubscriber();

    this.subscriber.on('pmessage', (pattern, channel, message) => {
      this.handleRedisMessage(channel, message);
    });

    // Subscribe to ride events using pattern matching
    this.subscriber.psubscribe('tenant:*:ride:*');
    this.subscriber.psubscribe('tenant:*:driver:*');
    this.subscriber.psubscribe('tenant:*:payment:*');
  }

  private handleRedisMessage(channel: string, message: string) {
    try {
      const data = JSON.parse(message);
      const socketIds = this.subscriptions.get(channel);

      if (socketIds && socketIds.size > 0) {
        // Emit to subscribed clients
        socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('update', {
            channel,
            data,
          });
        });
      }

      // Also broadcast specific events
      this.broadcastEvent(channel, data);
    } catch (error) {
      console.error('Failed to handle Redis message:', error);
    }
  }

  private broadcastEvent(channel: string, data: any) {
    // Parse channel to extract event type
    const parts = channel.split(':');
    // Format: tenant:{tenantId}:ride:{rideId}:{event}

    if (parts.length >= 5) {
      const tenantId = parts[1];
      const entityType = parts[2]; // 'ride', 'driver', 'payment'
      const entityId = parts[3];
      const eventType = parts[4];

      // Emit to room for this specific entity
      const room = `${tenantId}:${entityType}:${entityId}`;
      this.server.to(room).emit(eventType, data);
    }
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Clean up subscriptions
    this.subscriptions.forEach((socketIds, channel) => {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.subscriptions.delete(channel);
      }
    });
  }

  /**
   * Subscribe to ride updates
   */
  @SubscribeMessage('subscribe:ride')
  handleSubscribeRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionPayload,
  ) {
    const { tenantId, rideId } = payload;

    if (!tenantId || !rideId) {
      return { error: 'tenantId and rideId are required' };
    }

    // Join room for this ride
    const room = `${tenantId}:ride:${rideId}`;
    client.join(room);

    // Track subscription for Redis pub/sub
    const channels = [
      `tenant:${tenantId}:ride:${rideId}:driver_assigned`,
      `tenant:${tenantId}:ride:${rideId}:driver_arrived`,
      `tenant:${tenantId}:ride:${rideId}:trip_started`,
      `tenant:${tenantId}:ride:${rideId}:completed`,
      `tenant:${tenantId}:ride:${rideId}:cancelled`,
      `tenant:${tenantId}:ride:${rideId}:no_drivers`,
    ];

    channels.forEach((channel) => {
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel).add(client.id);
    });

    console.log(`Client ${client.id} subscribed to ride ${rideId}`);
    return { status: 'subscribed', rideId };
  }

  /**
   * Unsubscribe from ride updates
   */
  @SubscribeMessage('unsubscribe:ride')
  handleUnsubscribeRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionPayload,
  ) {
    const { tenantId, rideId } = payload;

    if (!tenantId || !rideId) {
      return { error: 'tenantId and rideId are required' };
    }

    // Leave room
    const room = `${tenantId}:ride:${rideId}`;
    client.leave(room);

    // Remove from Redis subscriptions
    this.subscriptions.forEach((socketIds, channel) => {
      if (channel.includes(rideId)) {
        socketIds.delete(client.id);
      }
    });

    console.log(`Client ${client.id} unsubscribed from ride ${rideId}`);
    return { status: 'unsubscribed', rideId };
  }

  /**
   * Subscribe to driver updates (for driver app)
   */
  @SubscribeMessage('subscribe:driver')
  handleSubscribeDriver(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionPayload,
  ) {
    const { tenantId, driverId } = payload;

    if (!tenantId || !driverId) {
      return { error: 'tenantId and driverId are required' };
    }

    // Join room for this driver
    const room = `${tenantId}:driver:${driverId}`;
    client.join(room);

    // Track subscription for ride offers
    const channels = [
      `tenant:${tenantId}:driver:${driverId}:offer`,
      `tenant:${tenantId}:driver:${driverId}:status`,
    ];

    channels.forEach((channel) => {
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel).add(client.id);
    });

    console.log(`Client ${client.id} subscribed to driver ${driverId}`);
    return { status: 'subscribed', driverId };
  }

  /**
   * Subscribe to driver location updates (for rider tracking driver)
   */
  @SubscribeMessage('subscribe:driver_location')
  handleSubscribeDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionPayload,
  ) {
    const { tenantId, driverId } = payload;

    if (!tenantId || !driverId) {
      return { error: 'tenantId and driverId are required' };
    }

    const channel = `tenant:${tenantId}:driver:${driverId}:location`;
    const room = `${tenantId}:driver:${driverId}:location`;

    client.join(room);

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel).add(client.id);

    console.log(
      `Client ${client.id} subscribed to driver ${driverId} location`,
    );
    return { status: 'subscribed', driverId };
  }

  /**
   * Ping/pong for connection health
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', timestamp: Date.now() };
  }
}
