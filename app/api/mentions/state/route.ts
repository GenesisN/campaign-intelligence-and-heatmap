import { NextResponse } from "next/server";
import { readMentionsState, writeMentionsState } from "@/lib/mentions-state";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readMentionsState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await readMentionsState();

    const next = {
      reviewedUrls: Array.isArray(body.reviewedUrls)
        ? body.reviewedUrls.filter((item: unknown): item is string => typeof item === "string")
        : current.reviewedUrls,
      savedUrls: Array.isArray(body.savedUrls)
        ? body.savedUrls.filter((item: unknown): item is string => typeof item === "string")
        : current.savedUrls,
      alertPreferences: {
        spikeThreshold:
          typeof body.alertPreferences?.spikeThreshold === "number"
            ? Math.max(2, Math.min(10, body.alertPreferences.spikeThreshold))
            : current.alertPreferences.spikeThreshold,
        showHighPriority:
          typeof body.alertPreferences?.showHighPriority === "boolean"
            ? body.alertPreferences.showHighPriority
            : current.alertPreferences.showHighPriority,
        showSpikes:
          typeof body.alertPreferences?.showSpikes === "boolean"
            ? body.alertPreferences.showSpikes
            : current.alertPreferences.showSpikes,
      },
    };

    await writeMentionsState(next);
    return NextResponse.json(next);
  } catch (error) {
    console.error("Failed to update mention state:", error);
    return NextResponse.json(
      { error: "Failed to update mention state" },
      { status: 500 }
    );
  }
}
