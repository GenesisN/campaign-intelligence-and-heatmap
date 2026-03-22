import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "mentions-state.json");

export interface MentionAlertPreferences {
  spikeThreshold: number;
  showHighPriority: boolean;
  showSpikes: boolean;
}

export interface MentionsServerState {
  reviewedUrls: string[];
  savedUrls: string[];
  alertPreferences: MentionAlertPreferences;
}

const DEFAULT_STATE: MentionsServerState = {
  reviewedUrls: [],
  savedUrls: [],
  alertPreferences: {
    spikeThreshold: 2,
    showHighPriority: true,
    showSpikes: true,
  },
};

async function ensureStateFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STATE_FILE);
  } catch {
    await fs.writeFile(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2), "utf8");
  }
}

export async function readMentionsState(): Promise<MentionsServerState> {
  await ensureStateFile();

  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<MentionsServerState>;
    return {
      reviewedUrls: Array.isArray(parsed.reviewedUrls) ? parsed.reviewedUrls : [],
      savedUrls: Array.isArray(parsed.savedUrls) ? parsed.savedUrls : [],
      alertPreferences: {
        spikeThreshold:
          typeof parsed.alertPreferences?.spikeThreshold === "number"
            ? parsed.alertPreferences.spikeThreshold
            : DEFAULT_STATE.alertPreferences.spikeThreshold,
        showHighPriority:
          typeof parsed.alertPreferences?.showHighPriority === "boolean"
            ? parsed.alertPreferences.showHighPriority
            : DEFAULT_STATE.alertPreferences.showHighPriority,
        showSpikes:
          typeof parsed.alertPreferences?.showSpikes === "boolean"
            ? parsed.alertPreferences.showSpikes
            : DEFAULT_STATE.alertPreferences.showSpikes,
      },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function writeMentionsState(state: MentionsServerState) {
  await ensureStateFile();
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}
