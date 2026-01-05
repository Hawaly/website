import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';
import type { ServicePackageUpdate } from '@/types/service-packages';

/**
 * GET /api/packages/[id]
 * Récupère un pack avec tous ses détails (features, templates)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params;

    const { data: packageData, error } = await supabaseAdmin
      .from('service_package')
      .select(`
        *,
        features:package_feature(*),
        task_templates:package_task_template(*),
        mandat_template:package_mandat_template(*),
        invoice_template:package_invoice_template(*)
      `)
      .eq('id', packageId)
      .single();

    if (error || !packageData) {
      return NextResponse.json(
        { error: 'Pack non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: packageData,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur GET /api/packages/[id]:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la récupération du pack' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/packages/[id]
 * Met à jour un pack (Admin uniquement)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId } = await params;
    const body: ServicePackageUpdate = await request.json();

    // Si on modifie le slug, vérifier unicité
    if (body.slug) {
      const { data: existing } = await supabaseAdmin
        .from('service_package')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', packageId)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Un autre pack utilise déjà ce slug' },
          { status: 409 }
        );
      }
    }

    // Mettre à jour
    const { data: updatedPackage, error } = await supabaseAdmin
      .from('service_package')
      .update(body)
      .eq('id', packageId)
      .select()
      .single();

    if (error || !updatedPackage) {
      throw new Error(`Erreur mise à jour: ${error?.message || 'Pack non trouvé'}`);
    }

    return NextResponse.json({
      success: true,
      package: updatedPackage,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur PATCH /api/packages/[id]:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour du pack' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/packages/[id]
 * Supprime un pack (Admin uniquement)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId } = await params;

    // Vérifier si le pack est utilisé par des clients
    const { data: usedBy, error: checkError } = await supabaseAdmin
      .from('client_package')
      .select('id')
      .eq('package_id', packageId)
      .limit(1);

    if (checkError) {
      throw new Error(`Erreur vérification: ${checkError.message}`);
    }

    if (usedBy && usedBy.length > 0) {
      return NextResponse.json(
        { error: 'Ce pack est utilisé par des clients et ne peut pas être supprimé. Désactivez-le plutôt.' },
        { status: 409 }
      );
    }

    // Supprimer (CASCADE supprimera aussi features, templates, etc.)
    const { error: deleteError } = await supabaseAdmin
      .from('service_package')
      .delete()
      .eq('id', packageId);

    if (deleteError) {
      throw new Error(`Erreur suppression: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Pack supprimé avec succès',
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur DELETE /api/packages/[id]:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la suppression du pack' },
      { status: 500 }
    );
  }
}
