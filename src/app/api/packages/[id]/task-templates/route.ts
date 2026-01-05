import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';
import type { PackageTaskTemplateInsert } from '@/types/service-packages';

/**
 * GET /api/packages/[id]/task-templates
 * Liste les templates de tâches d'un pack
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params;

    const { data: templates, error } = await supabaseAdmin
      .from('package_task_template')
      .select('*')
      .eq('package_id', packageId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Erreur récupération task templates: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur GET task-templates:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la récupération des templates de tâches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packages/[id]/task-templates
 * Ajoute un template de tâche à un pack (Admin uniquement)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id: packageId } = await params;
    const body: Omit<PackageTaskTemplateInsert, 'package_id'> = await request.json();

    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Champs requis: title, type' },
        { status: 400 }
      );
    }

    const { data: newTemplate, error } = await supabaseAdmin
      .from('package_task_template')
      .insert({
        ...body,
        package_id: parseInt(packageId),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création template: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      template: newTemplate,
    }, { status: 201 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur POST task-templates:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la création du template de tâche' },
      { status: 500 }
    );
  }
}
