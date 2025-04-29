import KeycloakConnect from 'keycloak-connect';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

export class AuthService {
  private keycloak: KeycloakConnect.Keycloak;

  constructor() {
    const keycloakConfig = {
      realm: config.keycloak.realm,
      'auth-server-url': config.keycloak.authServerUrl,
      'ssl-required': 'external',
      resource: config.keycloak.clientId,
      'confidential-port': 0,
      'bearer-only': true
    };

    this.keycloak = new KeycloakConnect({}, keycloakConfig);
  }

  protect() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await this.keycloak.protect()(req, res, next);
      } catch (error) {
        logger.error({ error }, 'Authentication error');
        res.status(401).json({ error: 'Unauthorized' });
      }
    };
  }

  protectRole(role: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await this.keycloak.protect(`realm:${role}`)(req, res, next);
      } catch (error) {
        logger.error({ error, role }, 'Role authorization error');
        res.status(403).json({ error: 'Forbidden' });
      }
    };
  }

  getUserInfo(req: Request): any {
    const token = this.keycloak.getToken(req);
    if (!token) {
      return null;
    }
    return {
      id: token.content.sub,
      username: token.content.preferred_username,
      email: token.content.email,
      roles: token.content.realm_access?.roles || []
    };
  }

  isAuthenticated(req: Request): boolean {
    return !!this.keycloak.getToken(req);
  }

  hasRole(req: Request, role: string): boolean {
    const token = this.keycloak.getToken(req);
    if (!token) {
      return false;
    }
    return token.hasRole(role);
  }
}
