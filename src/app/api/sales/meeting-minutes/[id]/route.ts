import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from("meeting_minutes")
      .select(`
        *,
        prospects (
          id,
          company_name
        ),
        meetings (
          id,
          title,
          scheduled_date
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching meeting minutes:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting minutes" },
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
      .from("meeting_minutes")
      .update(body)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating meeting minutes:", error);
    return NextResponse.json(
      { error: "Failed to update meeting minutes" },
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
      .from("meeting_minutes")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meeting minutes:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting minutes" },
      { status: 500 }
    );
  }
}
