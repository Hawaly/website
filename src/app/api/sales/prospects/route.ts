import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("prospects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des prospects:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des prospects" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
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
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("prospects")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création du prospect:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création du prospect" },
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
