import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSession } from "@/lib/authz";

export async function GET(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Comptes-rendus de réunions confidentiels
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { data, error } = await supabaseAdmin
      .from("meeting_minutes")
      .select(`
        *,
        prospects (
          company_name
        )
      `)
      .order("meeting_date", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des PV:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des PV" },
        { status: 500 }
      );
    }

    const formattedData = data?.map((minute: any) => ({
      ...minute,
      prospect_name: minute.prospects?.company_name,
      prospects: undefined,
    }));

    return NextResponse.json(formattedData || []);
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Création de PV restreinte
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("meeting_minutes")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création du PV:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création du PV" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
