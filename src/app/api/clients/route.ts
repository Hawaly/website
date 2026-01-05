import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { data: clients, error } = await supabaseAdmin
      .from('client')
      .select('id, name, company_name, status')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
