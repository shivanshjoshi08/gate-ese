import crypto from "crypto";

/** Params Cloudinary expects for signed uploads (excluding api_key, file, resource_type). */
export function signCloudinaryUpload(folder?: string): {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    process.env.CLOUDINARY_CLOUD_NAME ??
    "";
  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error("Cloudinary env vars missing");
  }
  const timestamp = Math.round(Date.now() / 1000);
  const uploadFolder = folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER ?? "gate-questions";
  const params: Record<string, string | number> = {
    timestamp,
    folder: uploadFolder,
  };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");

  return { timestamp, signature, apiKey, cloudName, folder: uploadFolder };
}
