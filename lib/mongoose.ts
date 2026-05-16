import dns, { setDefaultResultOrder } from "node:dns";
import mongoose from "mongoose";
import { atlasSrvUriToTlsSeedListUri } from "@/lib/mongo-atlas-doh";

const globalWithMongoose = globalThis as typeof globalThis & {
  __mongoConnectPromise?: Promise<typeof mongoose> | null;
  __mongoDnsPrepared?: boolean;
};

const inflight = globalWithMongoose;

if (!("__mongoConnectPromise" in inflight)) {
  inflight.__mongoConnectPromise = null;
}
if (!("__mongoDnsPrepared" in inflight)) {
  inflight.__mongoDnsPrepared = false;
}

/**
 * Atlas `mongodb+srv://` uses SRV DNS. On some Windows / ISP resolvers, `querySrv`
 * returns ECONNREFUSED. Using public DNS for the Node process sometimes fixes it.
 * Set `MONGODB_SRV_DNS=off` to skip (corporate VPN / split DNS).
 * On Linux/macOS: set `MONGODB_SRV_DNS=public` to force the same behavior.
 */
function prepareDnsForMongoSrv(uri: string) {
  if (!uri.startsWith("mongodb+srv://")) return;
  if (inflight.__mongoDnsPrepared) return;

  const mode = process.env.MONGODB_SRV_DNS?.trim().toLowerCase() ?? "";
  if (mode === "off" || mode === "0" || mode === "false") {
    inflight.__mongoDnsPrepared = true;
    return;
  }

  const usePublicDns =
    mode === "public" ||
    mode === "1" ||
    mode === "true" ||
    (mode === "" && process.platform === "win32");

  if (!usePublicDns) {
    inflight.__mongoDnsPrepared = true;
    return;
  }

  try {
    setDefaultResultOrder("ipv4first");
  } catch {
    /* Node < 17 — ignore */
  }

  const servers =
    process.env.MONGODB_DNS_SERVERS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? ["8.8.8.8", "1.1.1.1"];

  dns.setServers(servers);
  inflight.__mongoDnsPrepared = true;
}

/**
 * For `mongodb+srv://`, bypass OS UDP resolver by fetching SRV/TXT over HTTPS
 * (unless `MONGODB_SRV_DOH=off`).
 */
async function resolvedMongoUri(raw: string): Promise<string> {
  if (!raw.startsWith("mongodb+srv://")) {
    return raw;
  }

  const d = process.env.MONGODB_SRV_DOH?.trim().toLowerCase() ?? "";
  if (d === "off" || d === "0" || d === "false") {
    return raw;
  }

  return atlasSrvUriToTlsSeedListUri(raw);
}

/**
 * Cached Mongo connect (per server / hot-reload).
 * Clears failed attempts so the next request can retry.
 */
export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  prepareDnsForMongoSrv(uri);

  if (!inflight.__mongoConnectPromise) {
    inflight.__mongoConnectPromise = (async () => {
      const resolved = await resolvedMongoUri(uri);
      await mongoose.connect(resolved, {
        serverSelectionTimeoutMS: 15_000,
        connectTimeoutMS: 15_000,
        family: 4,
      });
      return mongoose;
    })();
  }

  try {
    return await inflight.__mongoConnectPromise;
  } catch (e) {
    inflight.__mongoConnectPromise = null;
    await mongoose.disconnect().catch(() => {});
    throw e;
  }
}
