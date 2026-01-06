import { z } from 'zod';

/**
 * Schéma de validation pour le login
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim()
    .max(255, 'Email trop long'),
  password: z.string()
    .min(8, 'Mot de passe trop court')
    .max(100, 'Mot de passe trop long')
});

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim()
    .max(255, 'Email trop long'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

/**
 * Schéma pour le changement de mot de passe
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas",
  path: ["confirmNewPassword"],
});

/**
 * Nettoie une entrée en supprimant les caractères dangereux pour SQL
 * ATTENTION: Utiliser uniquement en complément des prepared statements
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    // Supprimer les commentaires SQL
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    // Supprimer les caractères d'échappement dangereux
    .replace(/['";\\]/g, '')
    // Supprimer les commandes SQL communes
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|SCRIPT|JAVASCRIPT)\b/gi, '')
    // Supprimer les caractères de contrôle
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Supprimer les espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Vérifie si une chaîne contient des patterns d'injection SQL
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
    /(--|\||;|\/\*|\*\/|xp_|sp_|0x)/i,
    /(\bOR\b\s*\d+\s*=\s*\d+)/i,
    /(\bAND\b\s*\d+\s*=\s*\d+)/i,
    /(\bOR\b\s*'[^']*'\s*=\s*'[^']*')/i,
    /(\bAND\b\s*'[^']*'\s*=\s*'[^']*')/i,
    /(EXEC|EXECUTE|CAST|DECLARE|NVARCHAR|VARCHAR)/i,
    /(INTO\s+(OUTFILE|DUMPFILE))/i,
    /(LOAD_FILE|BENCHMARK|SLEEP|WAITFOR)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Valide et nettoie un email
 */
export function validateEmail(email: string): string | null {
  try {
    const validated = loginSchema.shape.email.parse(email);
    
    // Vérification supplémentaire pour les injections
    if (detectSQLInjection(validated)) {
      console.error('🚨 Tentative d\'injection SQL détectée dans l\'email:', email);
      return null;
    }
    
    return validated;
  } catch {
    return null;
  }
}

/**
 * Type pour les données de login validées
 */
export type ValidatedLoginData = z.infer<typeof loginSchema>;
export type ValidatedRegisterData = z.infer<typeof registerSchema>;
export type ValidatedChangePasswordData = z.infer<typeof changePasswordSchema>;
