import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("activities")
      .select(`
        *,
        prospects (
          company_name
        )
      `)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des activités:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des activités" },
        { status: 500 }
      );
    }

    const formattedData = data?.map((activity: any) => ({
      ...activity,
      prospect_name: activity.prospects?.company_name,
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
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("activities")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création de l'activité:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création de l'activité" },
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
