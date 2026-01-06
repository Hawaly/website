import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSession } from "@/lib/authz";

export async function GET(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Pitch decks = stratégie commerciale confidentielle
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { data, error } = await supabaseAdmin
      .from("pitch_decks")
      .select(`
        *,
        prospects (
          company_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des pitch decks:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des pitch decks" },
        { status: 500 }
      );
    }

    const formattedData = data?.map((deck: any) => ({
      ...deck,
      prospect_name: deck.prospects?.company_name,
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
    // 🔒 SÉCURITÉ: Création de pitch decks restreinte
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("pitch_decks")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création du pitch deck:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création du pitch deck" },
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
