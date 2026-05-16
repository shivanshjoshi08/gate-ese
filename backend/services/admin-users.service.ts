import { connectMongo } from "@/lib/mongoose";
import { User } from "@/models/User";
import { UserProgress } from "@/models/UserProgress";
import type { AttemptRecord, ExamType, ProgressData } from "@/lib/types";
import {
  latestIsoDate,
  mergeProgressSummaries,
  summarizeProgressSnapshot,
  type ProgressSummary,
} from "@/lib/user-activity";

export type AdminLearnerListItem = {
  id: string;
  email: string;
  name: string;
  registeredAt: string;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  lastCloudSyncAt: string | null;
  lastAttemptAt: string | null;
  stats: ProgressSummary;
  hasCloudProgress: boolean;
};

export type AdminLearnerDetail = AdminLearnerListItem & {
  byExam: Record<
    ExamType,
    {
      updatedAt: string | null;
      summary: ProgressSummary;
      recentAttempts: AttemptRecord[];
    }
  >;
  recentAttempts: (AttemptRecord & { slot: ExamType })[];
};

type LeanUser = {
  _id: unknown;
  email: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date | null;
  lastActivityAt?: Date | null;
  lastAttemptAt?: Date | null;
};

function learnerFilter() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return {};
  return { email: { $ne: adminEmail } };
}

type LeanProgress = {
  userId: string;
  exam: ExamType;
  snapshot?: ProgressData;
  updatedAt?: Date;
};

function mapUserBase(row: LeanUser): Omit<AdminLearnerListItem, "stats" | "hasCloudProgress" | "lastCloudSyncAt" | "lastAttemptAt"> {
  return {
    id: String(row._id),
    email: row.email,
    name: row.name ?? "",
    registeredAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    lastActivityAt: row.lastActivityAt?.toISOString() ?? null,
  };
}

export async function listLearnersForAdmin(): Promise<AdminLearnerListItem[]> {
  await connectMongo();
  const [users, progressRows] = await Promise.all([
    User.find(learnerFilter())
      .select(
        "email name createdAt updatedAt lastLoginAt lastActivityAt lastAttemptAt",
      )
      .sort({ createdAt: -1 })
      .lean<LeanUser[]>(),
    UserProgress.find({})
      .select("userId exam snapshot updatedAt")
      .lean<LeanProgress[]>(),
  ]);

  const progressByUser = new Map<
    string,
    { ese?: LeanProgress; gate?: LeanProgress; lastSync: Date | null }
  >();

  for (const row of progressRows) {
    const uid = row.userId;
    let slot = progressByUser.get(uid);
    if (!slot) {
      slot = { lastSync: null };
      progressByUser.set(uid, slot);
    }
    if (row.exam === "ESE") slot.ese = row;
    if (row.exam === "GATE") slot.gate = row;
    const updated = row.updatedAt ?? null;
    if (updated && (!slot.lastSync || updated > slot.lastSync)) {
      slot.lastSync = updated;
    }
  }

  return users.map((u) => {
    const base = mapUserBase(u);
    const slots = progressByUser.get(base.id);
    const eseSummary = summarizeProgressSnapshot(slots?.ese?.snapshot);
    const gateSummary = summarizeProgressSnapshot(slots?.gate?.snapshot);
    const stats = mergeProgressSummaries(eseSummary, gateSummary);

    const lastCloudSyncAt = slots?.lastSync?.toISOString() ?? null;

    return {
      ...base,
      stats,
      hasCloudProgress: !!(slots?.ese || slots?.gate),
      lastCloudSyncAt,
      lastAttemptAt: latestIsoDate(
        stats.lastAttemptAt,
        u.lastAttemptAt,
        base.lastActivityAt,
        lastCloudSyncAt,
      ),
    };
  });
}

function recentAttemptsFromSnapshot(
  snapshot: ProgressData | undefined,
  limit: number,
): AttemptRecord[] {
  if (!snapshot?.attempts?.length) return [];
  return [...snapshot.attempts]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export async function getLearnerDetailForAdmin(
  userId: string,
): Promise<AdminLearnerDetail | null> {
  await connectMongo();
  const user = await User.findOne({ _id: userId, ...learnerFilter() })
    .select(
      "email name createdAt updatedAt lastLoginAt lastActivityAt lastAttemptAt",
    )
    .lean<LeanUser | null>();
  if (!user) return null;

  const progressRows = await UserProgress.find({ userId })
    .select("exam snapshot updatedAt")
    .lean<LeanProgress[]>();

  const eseRow = progressRows.find((r) => r.exam === "ESE");
  const gateRow = progressRows.find((r) => r.exam === "GATE");

  const eseSummary = summarizeProgressSnapshot(eseRow?.snapshot);
  const gateSummary = summarizeProgressSnapshot(gateRow?.snapshot);
  const stats = mergeProgressSummaries(eseSummary, gateSummary);

  const lastCloudSyncAt = latestIsoDate(
    eseRow?.updatedAt,
    gateRow?.updatedAt,
  );

  const base = mapUserBase(user);
  const recentAttempts: (AttemptRecord & { slot: ExamType })[] = [];
  for (const row of progressRows) {
    for (const a of recentAttemptsFromSnapshot(row.snapshot, 50)) {
      recentAttempts.push({ ...a, slot: row.exam });
    }
  }
  recentAttempts.sort((a, b) => b.timestamp - a.timestamp);

  return {
    ...base,
    stats,
    hasCloudProgress: progressRows.length > 0,
    lastCloudSyncAt,
    lastAttemptAt: latestIsoDate(
      stats.lastAttemptAt,
      user.lastAttemptAt,
      base.lastActivityAt,
      lastCloudSyncAt,
    ),
    byExam: {
      ESE: {
        updatedAt: eseRow?.updatedAt?.toISOString() ?? null,
        summary: eseSummary,
        recentAttempts: recentAttemptsFromSnapshot(eseRow?.snapshot, 15),
      },
      GATE: {
        updatedAt: gateRow?.updatedAt?.toISOString() ?? null,
        summary: gateSummary,
        recentAttempts: recentAttemptsFromSnapshot(gateRow?.snapshot, 15),
      },
    },
    recentAttempts: recentAttempts.slice(0, 30),
  };
}

export async function touchUserLogin(userId: string): Promise<void> {
  await connectMongo();
  const now = new Date();
  await User.findByIdAndUpdate(userId, {
    $set: { lastLoginAt: now, lastActivityAt: now },
  }).exec();
}

export async function touchUserProgressActivity(
  userId: string,
  progress: ProgressData,
): Promise<void> {
  await connectMongo();
  const summary = summarizeProgressSnapshot(progress);
  const now = new Date();
  await User.findByIdAndUpdate(userId, {
    $set: {
      lastActivityAt: now,
      ...(summary.lastAttemptAt
        ? { lastAttemptAt: new Date(summary.lastAttemptAt) }
        : {}),
    },
  }).exec();
}
