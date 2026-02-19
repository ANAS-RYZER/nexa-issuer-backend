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

  async storeTokens(
    sessionId: string,
    userId: string,
    refreshToken: string,
    expiresIn: number = 7 * 24 * 60 * 60, // 7 days in seconds
  ): Promise<void> {
    const expiry = Date.now() + expiresIn * 1000;

    this.sessionStore.set(sessionId, {
      userId,
      refreshToken,
      createdAt: Date.now().toString(),
      expiry,
    });

    this.logger.log(`Session stored: ${sessionId}`);

    // Auto cleanup after expiry
    setTimeout(() => {
      this.sessionStore.delete(sessionId);
    }, expiresIn * 1000);
  }

  async getSessionData(sessionId: string): Promise<{
    userId: string;
    refreshToken: string;
    createdAt: string;
  } | null> {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      return null;
    }

    if (Date.now() > session.expiry) {
      this.sessionStore.delete(sessionId);
      return null;
    }

    return {
      userId: session.userId,
      refreshToken: session.refreshToken,
      createdAt: session.createdAt,
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessionStore.delete(sessionId);
    this.logger.log(`Session deleted: ${sessionId}`);
  }

  async refreshSessionExpiry(
    sessionId: string,
    expiresIn: number = 7 * 24 * 60 * 60,
  ): Promise<void> {
    const session = this.sessionStore.get(sessionId);

    if (session) {
      session.expiry = Date.now() + expiresIn * 1000;
      this.logger.log(`Session expiry refreshed: ${sessionId}`);
    }
  }
}

