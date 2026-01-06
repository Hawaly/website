import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Rate limiter pour prévenir les attaques par force brute
 */
class RateLimiter {
  private cache: LRUCache<string, number[]>;
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions = {}) {
    this.options = {
      uniqueTokenPerInterval: options.uniqueTokenPerInterval ?? 5,
      interval: options.interval ?? 60000, // 1 minute par défaut
    };

    this.cache = new LRUCache<string, number[]>({
      max: 10000, // Maximum 10000 clés en cache
      ttl: this.options.interval * 2, // TTL = 2x l'intervalle
    });
  }

  /**
   * Vérifie si une requête peut passer le rate limit
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.options.interval;
    
    // Récupérer les tentatives existantes
    const attempts = this.cache.get(identifier) || [];
    
    // Filtrer les tentatives dans la fenêtre actuelle
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
    
    // Calculer le temps de reset
    const oldestAttempt = recentAttempts[0] || now;
    const reset = new Date(oldestAttempt + this.options.interval);
    
    // Vérifier si on dépasse la limite
    if (recentAttempts.length >= this.options.uniqueTokenPerInterval) {
      return {
        success: false,
        limit: this.options.uniqueTokenPerInterval,
        remaining: 0,
        reset,
      };
    }
    
    // Ajouter la nouvelle tentative
    recentAttempts.push(now);
    this.cache.set(identifier, recentAttempts);
    
    return {
      success: true,
      limit: this.options.uniqueTokenPerInterval,
      remaining: this.options.uniqueTokenPerInterval - recentAttempts.length,
      reset,
    };
  }

  /**
   * Réinitialise le compteur pour un identifiant
   */
  reset(identifier: string): void {
    this.cache.delete(identifier);
  }

  /**
   * Réinitialise tous les compteurs
   */
  resetAll(): void {
    this.cache.clear();
  }
}

// Instances de rate limiters pour différents usages
export const loginRateLimiter = new RateLimiter({
  uniqueTokenPerInterval: 5, // 5 tentatives
  interval: 60000, // par minute
});

export const apiRateLimiter = new RateLimiter({
  uniqueTokenPerInterval: 100, // 100 requêtes
  interval: 60000, // par minute
});

export const passwordResetRateLimiter = new RateLimiter({
  uniqueTokenPerInterval: 3, // 3 tentatives
  interval: 3600000, // par heure
});

/**
 * Middleware pour vérifier le rate limit
 */
export async function checkRateLimit(
  identifier: string,
  limiter: RateLimiter = loginRateLimiter
): Promise<RateLimitResult> {
  return await limiter.check(identifier);
}

/**
 * Helper pour extraire l'identifiant d'une requête
 */
export function getRateLimitIdentifier(
  request: Request,
  additionalKey?: string
): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  let ip = '127.0.0.1';
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  }
  
  return additionalKey ? `${ip}:${additionalKey}` : ip;
}
