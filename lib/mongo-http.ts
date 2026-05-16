import { NextResponse } from "next/server";

function getMongoNumericCode(error: unknown): string {
  if (!error || typeof error !== "object") return "";
  const e = error as { code?: unknown; cause?: unknown };
  if (typeof e.code === "number") return String(e.code);
  if (e.cause && typeof e.cause === "object") {
    const c = (e.cause as { code?: unknown }).code;
    if (typeof c === "number") return String(c);
  }
  return "";
}

function isAuthFailure(msg: string, mongoCode: string): boolean {
  const m = msg.toLowerCase();
  if (/bad auth|authentication failed|not authorized on|unable to authenticate|invalid username or password/i.test(m)) {
    return true;
  }
  if (mongoCode === "18") return true;
  return false;
}

/** JSON body when MongoDB is unreachable (admin UI). */
export function mongoUnavailableResponse(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  const mongoCode = getMongoNumericCode(error);

  const syscallCode =
    error instanceof Error && "code" in error
      ? String((error as NodeJS.ErrnoException).code)
      : "";

  const srvDnsIssue =
    msg.includes("querySrv") ||
    msg.includes("_mongodb._tcp") ||
    (syscallCode === "ECONNREFUSED" && msg.toLowerCase().includes("mongodb"));

  const authIssue = isAuthFailure(msg, mongoCode);

  let fix: string[];

  if (srvDnsIssue) {
    fix = [
      "Restart `npm run dev`. For `querySrv` / SRV errors, use Atlas “standard” `mongodb://…` URI instead of `mongodb+srv://`.",
      "Atlas → Network Access: allow your IP (or `0.0.0.0/0` for dev only).",
      "VPN / firewall: try off, or set `MONGODB_SRV_DNS=off` in `.env.local` if supported.",
    ];
  } else if (authIssue) {
    fix = [
      "`bad auth`: fix user/password in the URI; URL-encode special characters in passwords.",
      "Atlas Database Access: user exists; reset password and paste into URI.",
      "Format: `mongodb+srv://USER:ENCODED_PASS@cluster/DBNAME?retryWrites=true&w=majority`.",
    ];
  } else {
    fix = [
      "Paste `MONGODB_URI` again from Atlas (same user + network rules).",
      "Local Mongo: ensure `mongod` is running and credentials match.",
    ];
  }

  return NextResponse.json(
    {
      error: "Could not reach MongoDB. Save/publish failed.",
      detail: msg,
      fix,
    },
    { status: 503 }
  );
}
