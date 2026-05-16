/**
 * Atlas `mongodb+srv://` resolves SRV/TXT over DNS (UDP). Some networks return
 * `querySrv ECONNREFUSED`. Resolve the same records via DNS-over-HTTPS (TLS 443 only)
 * and emit a plain `mongodb://seed1:27017,...` URI with TLS.
 */

type DohAnswer = { name?: string; type?: number; data?: string };

type DohPayload = {
  Status: number;
  Answer?: DohAnswer[];
};

const DEFAULT_DOH_ENDPOINTS = [
  "https://dns.google/resolve",
  "https://cloudflare-dns.com/dns-query",
];

function parseSrvUri(uriIn: string) {
  const prefix = "mongodb+srv://";
  const uri = uriIn.trim();
  if (!uri.toLowerCase().startsWith(prefix)) {
    throw new Error("Expected mongodb+srv URI");
  }
  const rest = uri.slice(prefix.length);
  const slash = rest.indexOf("/");
  const qIx = rest.indexOf("?");
  const endHost = slash >= 0 ? slash : qIx >= 0 ? qIx : rest.length;
  const beforePath = rest.slice(0, endHost);

  let username = "";
  let password = "";
  let hostname = "";

  const at = beforePath.lastIndexOf("@");
  if (at >= 0) {
    const auth = beforePath.slice(0, at);
    hostname = beforePath.slice(at + 1);
    const c = auth.indexOf(":");
    if (c >= 0) {
      try {
        username = decodeURIComponent(auth.slice(0, c));
      } catch {
        username = auth.slice(0, c);
      }
      try {
        password = decodeURIComponent(auth.slice(c + 1));
      } catch {
        password = auth.slice(c + 1);
      }
    } else {
      try {
        username = decodeURIComponent(auth);
      } catch {
        username = auth;
      }
    }
  } else {
    hostname = beforePath;
  }

  if (!hostname) throw new Error("Missing host in mongodb+srv URI");

  let dbPath = "";
  let query = "";
  if (slash >= 0) {
    if (qIx >= 0) {
      dbPath = rest.slice(slash + 1, qIx).replace(/^\/+|\/+$/g, "");
      query = rest.slice(qIx + 1);
    } else {
      dbPath = rest.slice(slash + 1).replace(/^\/+|\/+$/g, "");
    }
  } else if (qIx >= 0) {
    query = rest.slice(qIx + 1);
  }

  return { username, password, hostname, dbPath, query };
}

async function fetchDohJson(
  endpoint: string,
  name: string,
  dnsType: "SRV" | "TXT"
): Promise<DohAnswer[]> {
  const url = `${endpoint}?name=${encodeURIComponent(name)}&type=${dnsType}`;
  const headers: HeadersInit = endpoint.includes("cloudflare-dns.com")
    ? { accept: "application/dns-json" }
    : {};
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`DNS lookup HTTP ${res.status}`);
  const payload = (await res.json()) as DohPayload;
  if (payload.Status !== 0 || !payload.Answer?.length) {
    return [];
  }
  return payload.Answer;
}

async function lookupRecords(
  name: string,
  dnsType: "SRV" | "TXT",
  endpoints: string[]
): Promise<DohAnswer[]> {
  let lastErr: unknown;
  for (const ep of endpoints) {
    try {
      const answers = await fetchDohJson(ep, name, dnsType);
      if (answers.length) return answers;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

function parseSrvTargets(answers: DohAnswer[]): string[] {
  const rows: Array<{ prio: number; host: string; port: number }> = [];
  for (const a of answers) {
    if (a.type !== undefined && a.type !== 33) continue;
    const raw = String(a.data ?? "").trim();
    const parts = raw.split(/\s+/);
    if (parts.length < 4) continue;
    const prio = Number(parts[0]);
    const port = Number(parts[2]);
    let target = parts.slice(3).join(" ").trim();
    if (target.endsWith(".")) target = target.slice(0, -1);
    if (!Number.isFinite(port) || !target) continue;
    rows.push({ prio: Number.isFinite(prio) ? prio : 0, host: target, port });
  }
  rows.sort((a, b) => a.prio - b.prio);
  const seeds = rows.map((r) => `${r.host}:${r.port}`);
  return Array.from(new Set(seeds));
}

function parseTxtOptions(answers: DohAnswer[]): Record<string, string> {
  const out: Record<string, string> = {};
  /** Concatenate fragments (TXT can be chunked). */
  const parts: string[] = [];
  for (const a of answers) {
    if (a.type !== undefined && a.type !== 16) continue;
    let s = String(a.data ?? "");
    if (/^"(.*)"$/.test(s)) {
      try {
        s = JSON.parse(s) as string;
      } catch {
        s = s.slice(1, -1).replace(/\\"/g, '"');
      }
    }
    parts.push(s);
  }
  let glued = parts.join("");
  if (!glued.trim()) return out;

  if (/^mongodb(?:\+srv)?:\/\//i.test(glued.trim())) {
    const qi = glued.indexOf("?");
    glued = qi >= 0 ? glued.slice(qi + 1) : "";
  }

  try {
    new URLSearchParams(glued).forEach((v, k) => {
      out[k] = v;
    });
  } catch {
    glued.split("&").forEach((pair) => {
      const i = pair.indexOf("=");
      if (i < 0) return;
      out[decodeURIComponent(pair.slice(0, i)).trim()] = decodeURIComponent(
        pair.slice(i + 1).trim()
      );
    });
  }
  return out;
}

/** `mongodb+srv://…` → `mongodb://h1:27017,h2,.../db?…` (+ TLS defaults). */
export async function atlasSrvUriToTlsSeedListUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  const { username, password, hostname, dbPath, query } = parseSrvUri(uri);

  const custom = process.env.MONGODB_DOH_ENDPOINTS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const endpoints =
    custom && custom.length > 0 ? [...custom] : [...DEFAULT_DOH_ENDPOINTS];

  const srvName = `_mongodb._tcp.${hostname}`;
  const srvAnswers = await lookupRecords(srvName, "SRV", endpoints);
  const hosts = parseSrvTargets(srvAnswers);
  if (!hosts.length) {
    throw new Error(`DNS-over-HTTPS: no SRV answers for ${srvName}`);
  }

  const txtAnswers = await lookupRecords(hostname, "TXT", endpoints);
  const fromTxt = parseTxtOptions(txtAnswers);

  const qp = new URLSearchParams(query);
  for (const [k, v] of Object.entries(fromTxt)) {
    if (!qp.has(k)) qp.set(k, v);
  }
  if (!qp.has("tls") && !qp.has("ssl")) qp.set("tls", "true");
  if (!qp.has("authSource")) qp.set("authSource", "admin");

  const pathSeg = dbPath ? `/${dbPath.replace(/^\/+|\/+$/g, "")}` : "";

  let auth = "";
  if (username) {
    auth =
      password !== ""
        ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
        : `${encodeURIComponent(username)}@`;
  }

  return `mongodb://${auth}${hosts.join(",")}${pathSeg}?${qp.toString()}`;
}
