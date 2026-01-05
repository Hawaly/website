import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from("prospects")
      .select(`
        *,
        contacts (*),
        activities (*),
        meetings (*),
        meeting_minutes (*),
        pitch_decks (*)
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération du prospect:", error);
      return NextResponse.json(
        { error: "Prospect non trouvé" },
        { status: 404 }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .update(body)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour du prospect:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from("prospects")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Erreur lors de la suppression du prospect:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
