import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';

/**
 * GET /api/company-settings
 * Récupère les paramètres de l'agence
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { data, error } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erreur récupération settings: ${error.message}`);
    }

    // Si pas de settings, créer les valeurs par défaut
    if (!data) {
      const defaultSettings = {
        agency_name: 'YourStory Agency',
        address: 'Rue de la Paix 15',
        zip_code: '2000',
        city: 'Neuchâtel',
        country: 'Suisse',
        phone: '078 202 33 09',
        email: 'contact@yourstory.ch',
        tva_number: null,
        represented_by: 'Mohamad Hawaley',
        iban: 'CH00 0000 0000 0000 0000 0',
        qr_iban: 'CH44 3199 9123 0008 8901 2',
      };

      const { data: created, error: createError } = await supabaseAdmin
        .from('company_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (createError) {
        throw new Error(`Erreur création settings par défaut: ${createError.message}`);
      }

      return NextResponse.json({ settings: created });
    }

    return NextResponse.json({ settings: data });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur GET company-settings:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/company-settings
 * Met à jour les paramètres de l'agence
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: 'Paramètres requis' },
        { status: 400 }
      );
    }

    // Vérifier si les settings existent déjà
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('company_settings')
      .select('id')
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Erreur vérification settings: ${checkError.message}`);
    }

    let result;
    if (existing) {
      // Mettre à jour
      const { data, error } = await supabaseAdmin
        .from('company_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur mise à jour settings: ${error.message}`);
      }
      result = data;
    } else {
      // Créer
      const { data, error } = await supabaseAdmin
        .from('company_settings')
        .insert(settings)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur création settings: ${error.message}`);
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      settings: result,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur PUT company-settings:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}
