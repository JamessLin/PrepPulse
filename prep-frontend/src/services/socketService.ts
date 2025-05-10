import { io, Socket } from 'socket.io-client';
import { authService } from './authService';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface SocketHandlers {
  onMatch?: (data: { sessionId: string; token: string; roomName: string }) => void;
  onTimeout?: () => void;
  onError?: (error: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private handlers: SocketHandlers = {};
  private connectedUserId: string | null = null;

  /**
   * Connect to the socket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Get current user ID
        const userId = authService.getCurrentUserId();
        if (!userId) {
          reject(new Error('No authenticated user'));
          return;
        }

        // Get auth token
        const token = authService.getToken(userId);
        if (!token) {
          reject(new Error('No authentication token available'));
          return;
        }

        // Create socket connection with auth token
        this.socket = io(SOCKET_URL, {
          auth: {
            token
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });

        // Set up connection event handlers
        this.socket.on('connect', () => {
          console.log('Socket connected!');
          this.connectedUserId = userId;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          if (this.handlers.onError) {
            this.handlers.onError(error);
          }
          reject(error);
        });

        // Set up match and timeout event handlers
        this.setupEventHandlers();

      } catch (error) {
        console.error('Socket connection setup error:', error);
        reject(error);
      }
    });
  }

  /**
   * Set up event handlers for match and timeout events
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Match event - when a user is matched with another user
    this.socket.on('match', (data) => {
      console.log('Match found!', data);
      if (this.handlers.onMatch) {
        this.handlers.onMatch(data);
      }
    });

    // Timeout event - when no match is found within the timeout period
    this.socket.on('timeout', () => {
      console.log('Matchmaking timed out');
      if (this.handlers.onTimeout) {
        this.handlers.onTimeout();
      }
    });
  }

  /**
   * Join the matchmaking queue for a specific schedule
   */
  joinQueue(scheduleId: string): void {
    if (!this.socket || !this.connectedUserId) {
      console.error('Cannot join queue: Socket not connected');
      return;
    }

    console.log(`Joining queue for schedule ${scheduleId}`);
    this.socket.emit('joinQueue', {
      scheduleId,
      userId: this.connectedUserId
    });
  }

  /**
   * Register event handlers
   */
  registerHandlers(handlers: SocketHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Disconnect from the socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedUserId = null;
      console.log('Socket disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
export const socketService = new SocketService(); 