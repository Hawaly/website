import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: meeting, error } = await supabaseAdmin
      .from("meetings")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !meeting) {
      return NextResponse.json(
        { error: "Réunion non trouvée" },
        { status: 404 }
      );
    }

    const icsContent = generateICS(meeting);

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="meeting-${params.id}.ics"`,
      },
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

function generateICS(meeting: any): string {
  const formatDate = (date: string) => {
    return new Date(date)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const now = formatDate(new Date().toISOString());
  const start = formatDate(meeting.start_time);
  const end = formatDate(meeting.end_time);

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YourStory//Sales CRM//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${meeting.ics_uid || `meeting-${meeting.id}@yourstory.ch`}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${meeting.title}`,
  ];

  if (meeting.description) {
    ics.push(`DESCRIPTION:${meeting.description.replace(/\n/g, "\\n")}`);
  }

  if (meeting.location) {
    ics.push(`LOCATION:${meeting.location}`);
  }

  if (meeting.meeting_url) {
    ics.push(`URL:${meeting.meeting_url}`);
  }

  ics.push("STATUS:CONFIRMED");
  ics.push("SEQUENCE:0");
  ics.push("END:VEVENT");
  ics.push("END:VCALENDAR");

  return ics.join("\r\n");
}
