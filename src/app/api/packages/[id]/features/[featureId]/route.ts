import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';
import type { PackageFeatureUpdate } from '@/types/service-packages';

/**
 * PATCH /api/packages/[id]/features/[featureId]
 * Met à jour une feature spécifique
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; featureId: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId, featureId } = await params;
    const body: PackageFeatureUpdate = await request.json();

    const { data: updatedFeature, error } = await supabaseAdmin
      .from('package_feature')
      .update(body)
      .eq('id', featureId)
      .eq('package_id', packageId)
      .select()
      .single();

    if (error || !updatedFeature) {
      throw new Error(`Erreur mise à jour: ${error?.message || 'Feature non trouvée'}`);
    }

    return NextResponse.json({
      success: true,
      feature: updatedFeature,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur PATCH /api/packages/[id]/features/[featureId]:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour de la feature' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/packages/[id]/features/[featureId]
 * Supprime une feature
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; featureId: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId, featureId } = await params;

    const { error } = await supabaseAdmin
      .from('package_feature')
      .delete()
      .eq('id', featureId)
      .eq('package_id', packageId);

    if (error) {
      throw new Error(`Erreur suppression: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Feature supprimée avec succès',
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur DELETE /api/packages/[id]/features/[featureId]:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la suppression de la feature' },
      { status: 500 }
    );
  }
}
