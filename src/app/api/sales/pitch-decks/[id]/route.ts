import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from("pitch_decks")
      .select(`
        *,
        prospects (
          id,
          company_name
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pitch deck:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch deck" },
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
      .from("pitch_decks")
      .update(body)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating pitch deck:", error);
    return NextResponse.json(
      { error: "Failed to update pitch deck" },
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
      .from("pitch_decks")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pitch deck:", error);
    return NextResponse.json(
      { error: "Failed to delete pitch deck" },
      { status: 500 }
    );
  }
}
