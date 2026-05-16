import { signCloudinaryUpload } from "@/lib/cloudinary";

/** True when signed server uploads can be performed. */
export function isCloudinaryConfigured(): boolean {
  const secret = process.env.CLOUDINARY_API_SECRET;
  const key = process.env.CLOUDINARY_API_KEY;
  const cloud =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    process.env.CLOUDINARY_CLOUD_NAME;
  return !!(secret && key && cloud);
}

/**
 * Upload image bytes to Cloudinary (signed upload). Works on Vercel (no disk).
 */
export async function uploadImageBufferToCloudinary(
  buffer: Buffer,
  mime: string,
): Promise<string> {
  const sig = signCloudinaryUpload();
  const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
  const body = new FormData();
  body.append("file", dataUri);
  body.append("api_key", sig.apiKey);
  body.append("timestamp", String(sig.timestamp));
  body.append("signature", sig.signature);
  body.append("folder", sig.folder);

  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
  const res = await fetch(url, { method: "POST", body });
  const json = (await res.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };
  if (!res.ok || !json.secure_url) {
    throw new Error(
      json.error?.message ?? `Cloudinary upload failed (${res.status})`,
    );
  }
  return json.secure_url;
}
