import { io, Socket } from 'socket.io-client';
import { authService } from './authService';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface SocketHandlers {
  onMatch?: (data: { sessionId: string; token: string; roomName: string }) => void;
  onTimeout?: () => void;
  onError?: (error: any) => void;
  onAuthRequired?: () => void;
  onQueueJoined?: (data: { scheduleId: string; queueName: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private handlers: SocketHandlers = {};
  private connectedUserId: string | null = null;

  /**
   * Connect to the socket server
   */
  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if already connected
        if (this.socket?.connected) {
          console.log('Socket already connected');
          resolve();
          return;
        }
        
        // Get auth token from Supabase session
        const token = authService.getToken();
        if (!token) {
          console.log('Socket connection: No auth token available');
          
          // Notify via handler instead of rejecting
          if (this.handlers.onAuthRequired) {
            this.handlers.onAuthRequired();
          }
          
          // Reject with specific message but don't throw an error
          reject(new Error('Please log in to use real-time features'));
          return;
        }

        // Get user ID for tracking (but don't require it)
        const userId = await authService.getCurrentUserId();
        if (!userId) {
          console.log('Socket connection: No user ID available, proceeding anyway');
          // We'll continue without user ID - API should handle this
        }

        // Create socket connection with auth token
        this.socket = io(SOCKET_URL, {
          auth: {
            token
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 10000 // 10 second connection timeout
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

        // Disconnect handler
        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect' || reason === 'io client disconnect') {
            // Server/client initiated disconnect - don't reconnect
            this.socket = null;
            this.connectedUserId = null;
          }
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

    // Queue joined event - when the server confirms the user has joined the queue
    this.socket.on('queueJoinedSuccessfully', (data) => {
      console.log('Successfully joined queue:', data);
      if (this.handlers.onQueueJoined) {
        this.handlers.onQueueJoined(data);
      }
    });
  }

  /**
   * Join the matchmaking queue for a specific schedule
   */
  joinQueue(scheduleId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.log('Cannot join queue: Socket not connected');
      if (this.handlers.onError) {
        this.handlers.onError(new Error('Connection required to join queue'));
      }
      return;
    }

    // Use connectedUserId if available, otherwise try to get it from auth service
    const userId = this.connectedUserId || authService.getCurrentUserId();
    if (!userId) {
      console.log('Cannot join queue: No user ID, but continuing anyway');
      // We'll send the request without userId and let the server handle it
    }

    console.log(`Joining queue for schedule ${scheduleId}`);
    this.socket.emit('joinQueue', {
      scheduleId,
      userId: userId || undefined
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