import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';
import type { PackageMandatTemplateInsert, PackageMandatTemplateUpdate } from '@/types/service-packages';

/**
 * GET /api/packages/[id]/mandat-template
 * Récupère le template de mandat d'un pack
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params;

    const { data: template, error } = await supabaseAdmin
      .from('package_mandat_template')
      .select('*')
      .eq('package_id', packageId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw new Error(`Erreur récupération template: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      template: template || null,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur GET mandat-template:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la récupération du template de mandat' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/packages/[id]/mandat-template
 * Crée ou met à jour le template de mandat d'un pack
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId } = await params;
    const body: Omit<PackageMandatTemplateInsert, 'package_id'> | PackageMandatTemplateUpdate = await request.json();

    // Vérifier si un template existe déjà
    const { data: existing } = await supabaseAdmin
      .from('package_mandat_template')
      .select('id')
      .eq('package_id', packageId)
      .single();

    let result;
    if (existing) {
      // Mise à jour
      const { data, error } = await supabaseAdmin
        .from('package_mandat_template')
        .update(body)
        .eq('package_id', packageId)
        .select()
        .single();
      
      if (error) throw new Error(`Erreur mise à jour: ${error.message}`);
      result = data;
    } else {
      // Création
      const { data, error } = await supabaseAdmin
        .from('package_mandat_template')
        .insert({
          ...body,
          package_id: parseInt(packageId),
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erreur création: ${error.message}`);
      result = data;
    }

    return NextResponse.json({
      success: true,
      template: result,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur PUT mandat-template:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la sauvegarde du template de mandat' },
      { status: 500 }
    );
  }
}
