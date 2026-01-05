import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';
import type { PackageInvoiceTemplateInsert, PackageInvoiceTemplateUpdate } from '@/types/service-packages';

/**
 * GET /api/packages/[id]/invoice-template
 * Récupère le template de facturation d'un pack
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params;

    const { data: template, error } = await supabaseAdmin
      .from('package_invoice_template')
      .select('*')
      .eq('package_id', packageId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erreur récupération template: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      template: template || null,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur GET invoice-template:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la récupération du template de facture' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/packages/[id]/invoice-template
 * Crée ou met à jour le template de facturation d'un pack
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId } = await params;
    const body: Omit<PackageInvoiceTemplateInsert, 'package_id'> | PackageInvoiceTemplateUpdate = await request.json();

    // Vérifier si un template existe déjà
    const { data: existing } = await supabaseAdmin
      .from('package_invoice_template')
      .select('id')
      .eq('package_id', packageId)
      .single();

    let result;
    if (existing) {
      // Mise à jour
      const { data, error } = await supabaseAdmin
        .from('package_invoice_template')
        .update(body)
        .eq('package_id', packageId)
        .select()
        .single();
      
      if (error) throw new Error(`Erreur mise à jour: ${error.message}`);
      result = data;
    } else {
      // Création
      const { data, error } = await supabaseAdmin
        .from('package_invoice_template')
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
    console.error('Erreur PUT invoice-template:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la sauvegarde du template de facture' },
      { status: 500 }
    );
  }
}
