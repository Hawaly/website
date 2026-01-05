/**
 * Authorization helpers for API routes
 * Centralized authentication and authorization checks
 * 
 * ✅ Migré vers Supabase Auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from './supabase-server';
import { supabaseAdmin } from './supabaseAdmin';

export interface AuthSession {
  userId: number;
  authUserId: string;
  roleId: number;
  clientId?: number | null;
  email: string;
}

/**
 * Require authentication for API routes
 * Returns session if authenticated, or 401 response if not
 * 
 * ✅ Utilise Supabase Auth
 * 
 * Usage:
 * const session = await requireSession(request);
 * if (session instanceof NextResponse) return session; // 401 error
 * // Continue with authenticated session
 */
export async function requireSession(
  request: NextRequest
): Promise<AuthSession | NextResponse> {
  try {
    const supabase = await createClient();
    
    // 1. Vérifier session Supabase Auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter.' },
        { status: 401 }
      );
    }
    
    // 2. Récupérer les infos utilisateur depuis app_user
    const { data: userData, error: userError } = await supabaseAdmin
      .from('app_user')
      .select('id, email, role_id, client_id, auth_user_id')
      .eq('auth_user_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé.' },
        { status: 401 }
      );
    }
    
    return {
      userId: userData.id,
      authUserId: userData.auth_user_id,
      roleId: userData.role_id || 0,
      clientId: userData.client_id,
      email: userData.email,
    };
  } catch (error) {
    console.error('requireSession error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la session.' },
      { status: 500 }
    );
  }
}

/**
 * Require admin role (roleId === 1)
 * Returns session if admin, or 403 response if not
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AuthSession | NextResponse> {
  const sessionOrResponse = await requireSession(request);
  
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }
  
  if (sessionOrResponse.roleId !== 1) {
    return NextResponse.json(
      { error: 'Accès refusé. Droits administrateur requis.' },
      { status: 403 }
    );
  }
  
  return sessionOrResponse;
}

/**
 * Check if user owns a resource or is admin
 * For tenant isolation
 */
export function canAccessResource(
  session: AuthSession,
  resourceClientId: number
): boolean {
  // Admin can access all resources
  if (session.roleId === 1) {
    return true;
  }
  
  // Client can only access their own resources
  if (session.roleId === 2) {
    return session.clientId === resourceClientId;
  }
  
  // Staff role (roleId === 3) - depends on business logic
  // For now, deny by default
  return false;
}

/**
 * Require specific role(s)
 * Returns session if role matches, or 403 response if not
 * 
 * Usage:
 * const session = await requireRole(request, [1, 3]); // Admin or Staff
 * if (session instanceof NextResponse) return session;
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: number[]
): Promise<AuthSession | NextResponse> {
  const sessionOrResponse = await requireSession(request);
  
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }
  
  if (!allowedRoles.includes(sessionOrResponse.roleId)) {
    return NextResponse.json(
      { 
        error: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
        required_roles: allowedRoles,
        your_role: sessionOrResponse.roleId
      },
      { status: 403 }
    );
  }
  
  return sessionOrResponse;
}

/**
 * Assert ownership of a resource
 * Throws 403 if user doesn't own the resource (unless admin)
 * 
 * Usage:
 * const ownershipCheck = assertOwnership(session, { resourceClientId: invoice.client_id });
 * if (ownershipCheck instanceof NextResponse) return ownershipCheck;
 */
export function assertOwnership(
  session: AuthSession,
  options: { resourceClientId: number; resourceType?: string }
): NextResponse | null {
  if (!canAccessResource(session, options.resourceClientId)) {
    const resourceType = options.resourceType || 'ressource';
    return NextResponse.json(
      { 
        error: `Accès refusé. Cette ${resourceType} ne vous appartient pas.`,
        resource_client_id: options.resourceClientId,
        your_client_id: session.clientId
      },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Load invoice with ownership check
 * Returns invoice if authorized, or 403/404 response
 */
export async function loadInvoiceOr403(
  invoiceId: string | number,
  session: AuthSession
): Promise<any | NextResponse> {
  const { data: invoice, error } = await supabaseAdmin
    .from('invoice')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) {
    return NextResponse.json(
      { error: 'Facture non trouvée' },
      { status: 404 }
    );
  }

  // Check ownership
  const ownershipCheck = assertOwnership(session, {
    resourceClientId: invoice.client_id,
    resourceType: 'facture'
  });
  
  if (ownershipCheck) return ownershipCheck;

  return invoice;
}

/**
 * Load contract with ownership check
 * Returns contract if authorized, or 403/404 response
 */
export async function loadContractOr403(
  contractId: string | number,
  session: AuthSession
): Promise<any | NextResponse> {
  const { data: contract, error } = await supabaseAdmin
    .from('contrat')
    .select('*')
    .eq('id', contractId)
    .single();

  if (error || !contract) {
    return NextResponse.json(
      { error: 'Contrat non trouvé' },
      { status: 404 }
    );
  }

  // Check ownership
  const ownershipCheck = assertOwnership(session, {
    resourceClientId: contract.client_id,
    resourceType: 'contrat'
  });
  
  if (ownershipCheck) return ownershipCheck;

  return contract;
}

/**
 * Load expense with ownership check
 * Returns expense if authorized, or 403/404 response
 */
export async function loadExpenseOr403(
  expenseId: string | number,
  session: AuthSession
): Promise<any | NextResponse> {
  const { data: expense, error } = await supabaseAdmin
    .from('expense')
    .select('*')
    .eq('id', expenseId)
    .single();

  if (error || !expense) {
    return NextResponse.json(
      { error: 'Dépense non trouvée' },
      { status: 404 }
    );
  }

  // Check ownership (if expense is linked to a client)
  if (expense.client_id) {
    const ownershipCheck = assertOwnership(session, {
      resourceClientId: expense.client_id,
      resourceType: 'dépense'
    });
    
    if (ownershipCheck) return ownershipCheck;
  }

  return expense;
}
