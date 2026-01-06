import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSession } from "@/lib/authz";

export async function GET(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Planning de réunions sensible
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { data, error } = await supabaseAdmin
      .from("meetings")
      .select(`
        *,
        prospects (
          company_name
        )
      `)
      .eq("is_cancelled", false)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des réunions:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des réunions" },
        { status: 500 }
      );
    }

    const formattedData = data?.map((meeting: any) => ({
      ...meeting,
      prospect_name: meeting.prospects?.company_name,
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
    // 🔒 SÉCURITÉ: Création de réunions restreinte
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("meetings")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création de la réunion:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création de la réunion" },
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
