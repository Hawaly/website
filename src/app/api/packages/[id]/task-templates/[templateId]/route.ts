import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';
import type { PackageTaskTemplateUpdate } from '@/types/service-packages';

/**
 * PATCH /api/packages/[id]/task-templates/[templateId]
 * Met à jour un template de tâche
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId, templateId } = await params;
    const body: PackageTaskTemplateUpdate = await request.json();

    const { data: updated, error } = await supabaseAdmin
      .from('package_task_template')
      .update(body)
      .eq('id', templateId)
      .eq('package_id', packageId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Erreur mise à jour: ${error?.message || 'Template non trouvé'}`);
    }

    return NextResponse.json({
      success: true,
      template: updated,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur PATCH task-template:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour du template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/packages/[id]/task-templates/[templateId]
 * Supprime un template de tâche
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId, templateId } = await params;

    const { error } = await supabaseAdmin
      .from('package_task_template')
      .delete()
      .eq('id', templateId)
      .eq('package_id', packageId);

    if (error) {
      throw new Error(`Erreur suppression: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Template supprimé avec succès',
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur DELETE task-template:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la suppression du template' },
      { status: 500 }
    );
  }
}
