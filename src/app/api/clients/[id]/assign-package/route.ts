import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/authz';
import { assignPackageWithAutomation } from '@/lib/packageHelpers';

/**
 * POST /api/clients/[id]/assign-package
 * Associe un pack à un client avec création automatique du mandat, factures et tâches
 * 
 * Body:
 * {
 *   packageId: number;
 *   customPrice?: number;
 *   startDate?: string; // YYYY-MM-DD
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier auth admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: clientId } = await params;
    const body = await request.json();

    const { packageId, customPrice, startDate } = body;

    // Validation
    if (!packageId) {
      return NextResponse.json(
        { error: 'packageId est requis' },
        { status: 400 }
      );
    }

    // Exécuter l'orchestration complète
    const result = await assignPackageWithAutomation(
      parseInt(clientId),
      packageId,
      customPrice,
      startDate
    );

    return NextResponse.json({
      success: true,
      message: 'Pack assigné avec succès ! Mandat, factures et tâches créés automatiquement.',
      data: {
        mandat: result.mandat,
        invoicesCount: result.invoices.length,
        tasksCount: result.tasks.length,
        clientPackage: result.clientPackage,
      },
    }, { status: 201 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur POST assign-package:', err);
    return NextResponse.json(
      { 
        error: err.message || 'Erreur lors de l\'assignation du pack',
        details: err.stack 
      },
      { status: 500 }
    );
  }
}
