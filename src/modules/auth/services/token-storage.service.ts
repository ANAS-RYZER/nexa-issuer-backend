import { Injectable, Logger } from '@nestjs/common';

interface SessionData {
  userId: string;
  refreshToken: string;
  createdAt: string;
  expiry: number;
}

@Injectable()
export class TokenStorageService {
  private readonly logger = new Logger(TokenStorageService.name);
  private sessionStore: Map<string, SessionData> = new Map();

  /**
   * Store session with refresh token
   */
  async storeSession(
    sessionId: string,
    userId: string,
    refreshToken: string,
    expiresIn: number = 7 * 24 * 60 * 60, // 7 days in seconds
  ): Promise<void> {
    const expiry = Date.now() + expiresIn * 1000;

    this.sessionStore.set(sessionId, {
      userId,
      refreshToken,
      createdAt: new Date().toISOString(),
      expiry,
    });

    this.logger.log(`✅ Session stored: ${sessionId} for user ${userId}`);

    // Auto cleanup after expiry
    setTimeout(() => {
      this.sessionStore.delete(sessionId);
      this.logger.log(`🗑️ Session auto-expired: ${sessionId}`);
    }, expiresIn * 1000);
  }

  /**
   * Get session data by session ID
   */
  async getSession(sessionId: string): Promise<{
    userId: string;
    refreshToken: string;
    createdAt: string;
  } | null> {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      this.logger.warn(`❌ Session not found: ${sessionId}`);
      return null;
    }

    // Check if expired
    if (Date.now() > session.expiry) {
      this.sessionStore.delete(sessionId);
      this.logger.warn(`⏰ Session expired: ${sessionId}`);
      return null;
    }

    return {
      userId: session.userId,
      refreshToken: session.refreshToken,
      createdAt: session.createdAt,
    };
  }

  /**
   * Delete session (logout)
   */
  async deleteSession(sessionId: string): Promise<void> {
    const deleted = this.sessionStore.delete(sessionId);
    if (deleted) {
      this.logger.log(`🗑️ Session deleted: ${sessionId}`);
    } else {
      this.logger.warn(`❌ Session not found for deletion: ${sessionId}`);
    }
  }

  /**
   * Refresh session expiry
   */
  async refreshSessionExpiry(
    sessionId: string,
    expiresIn: number = 7 * 24 * 60 * 60,
  ): Promise<void> {
    const session = this.sessionStore.get(sessionId);

    if (session) {
      session.expiry = Date.now() + expiresIn * 1000;
      this.logger.log(`🔄 Session expiry refreshed: ${sessionId}`);
    } else {
      this.logger.warn(`❌ Session not found for refresh: ${sessionId}`);
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    const sessions: string[] = [];
    
    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (session.userId === userId && Date.now() < session.expiry) {
        sessions.push(sessionId);
      }
    }

    return sessions;
  }

  /**
   * Delete all sessions for a user (logout from all devices)
   */
  async deleteAllUserSessions(userId: string): Promise<number> {
    let count = 0;

    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (session.userId === userId) {
        this.sessionStore.delete(sessionId);
        count++;
      }
    }

    this.logger.log(`🗑️ Deleted ${count} sessions for user ${userId}`);
    return count;
  }

  /**
   * Get session statistics (for debugging/monitoring)
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  } {
    let activeSessions = 0;
    let expiredSessions = 0;
    const now = Date.now();

    for (const session of this.sessionStore.values()) {
      if (now < session.expiry) {
        activeSessions++;
      } else {
        expiredSessions++;
      }
    }

    return {
      totalSessions: this.sessionStore.size,
      activeSessions,
      expiredSessions,
    };
  }
}

