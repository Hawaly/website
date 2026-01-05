import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';
import type { PackageFeatureInsert } from '@/types/service-packages';

/**
 * GET /api/packages/[id]/features
 * Liste les features d'un pack
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params;

    const { data: features, error } = await supabaseAdmin
      .from('package_feature')
      .select('*')
      .eq('package_id', packageId)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Erreur récupération features: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      features: features || [],
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur GET /api/packages/[id]/features:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la récupération des features' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packages/[id]/features
 * Ajoute une feature à un pack (Admin uniquement)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId } = await params;
    const body: Omit<PackageFeatureInsert, 'package_id'> = await request.json();

    // Validation
    if (!body.title) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    // Créer la feature
    const { data: newFeature, error } = await supabaseAdmin
      .from('package_feature')
      .insert({
        ...body,
        package_id: parseInt(packageId),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création feature: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      feature: newFeature,
    }, { status: 201 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur POST /api/packages/[id]/features:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la création de la feature' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/packages/[id]/features
 * Met à jour plusieurs features d'un coup (réordonnancement)
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
    const body: { features: Array<{ id: number; display_order: number }> } = await request.json();

    // Mettre à jour l'ordre de chaque feature
    const updates = body.features.map(f =>
      supabaseAdmin
        .from('package_feature')
        .update({ display_order: f.display_order })
        .eq('id', f.id)
        .eq('package_id', packageId)
    );

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'Ordre des features mis à jour',
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur PATCH /api/packages/[id]/features:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour des features' },
      { status: 500 }
    );
  }
}
