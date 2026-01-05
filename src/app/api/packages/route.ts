import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';
import type { ServicePackageInsert } from '@/types/service-packages';

/**
 * GET /api/packages
 * Liste tous les packs de services
 * Query params:
 * - visible_only: true (pour n'afficher que les packs visibles sur le site)
 * - active_only: true (pour n'afficher que les packs actifs)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visibleOnly = searchParams.get('visible_only') === 'true';
    const activeOnly = searchParams.get('active_only') === 'true';
    const withFeatures = searchParams.get('with_features') === 'true';

    let query = supabaseAdmin
      .from('service_package')
      .select(withFeatures ? `
        *,
        features:package_feature(*)
      ` : '*')
      .order('display_order', { ascending: true });

    if (visibleOnly) {
      query = query.eq('is_visible', true);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: packages, error } = await query;

    if (error) {
      throw new Error(`Erreur récupération packs: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      packages: packages || [],
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur GET /api/packages:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la récupération des packs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packages
 * Crée un nouveau pack de services (Admin uniquement)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const body: ServicePackageInsert = await request.json();

    // Validation
    if (!body.name || !body.slug || body.price === undefined) {
      return NextResponse.json(
        { error: 'Champs requis: name, slug, price' },
        { status: 400 }
      );
    }

    // Vérifier unicité du slug
    const { data: existing } = await supabaseAdmin
      .from('service_package')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Un pack avec ce slug existe déjà' },
        { status: 409 }
      );
    }

    // Créer le pack
    const { data: newPackage, error } = await supabaseAdmin
      .from('service_package')
      .insert({
        ...body,
        created_by: session.userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création pack: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      package: newPackage,
    }, { status: 201 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur POST /api/packages:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la création du pack' },
      { status: 500 }
    );
  }
}
