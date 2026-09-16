/**
 * Cloudflare R2 Storage Upload Utility
 * S3-compatible object storage with zero egress fees
 */

// R2 Configuration from environment variables
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || "";

export interface R2UploadResult {
  url: string;
  key: string;
  size: number;
  filename: string;
}

/**
 * Generate AWS Signature V4 for authentication
 */
async function generateSignature(
  method: string,
  path: string,
  headers: Record<string, string>,
  payload: string
): Promise<string> {
  const algorithm = "AWS4-HMAC-SHA256";
  const service = "s3";
  const region = "auto";
  
  const dateTime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = dateTime.substring(0, 8);
  
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  
  // Canonical request
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
    .join("\n") + "\n";
    
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(";");
  
  const payloadHash = await sha256(payload);
  
  const canonicalRequest = [
    method,
    path,
    "", // query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  
  const canonicalRequestHash = await sha256(canonicalRequest);
  
  // String to sign
  const stringToSign = [
    algorithm,
    dateTime,
    credentialScope,
    canonicalRequestHash,
  ].join("\n");
  
  // Signing key
  const kDate = await hmac(`AWS4${R2_SECRET_ACCESS_KEY}`, date);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  
  const signature = await hmac(kSigning, stringToSign, true);
  
  return `${algorithm} Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

/**
 * SHA-256 hash function
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * HMAC-SHA256 function
 */
async function hmac(
  key: string | ArrayBuffer,
  message: string,
  hex = false
): Promise<string | ArrayBuffer> {
  const keyData = typeof key === "string" 
    ? new TextEncoder().encode(key) 
    : key;
    
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(message)
  );
  
  if (hex) {
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  
  return signature;
}

/**
 * Upload file to Cloudflare R2 via backend API
 */
export async function uploadToR2(file: File, folder = "evidence"): Promise<R2UploadResult> {
  if (!isR2Configured()) {
    throw new Error("R2 storage not configured. Check environment variables.");
  }

  try {
    // Step 1: Get presigned URL from backend
    const response = await fetch('/api/r2-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        folder,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get upload URL');
    }

    const { uploadUrl, publicUrl, key } = await response.json();

    // Step 2: Upload file to R2 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    return {
      url: publicUrl,
      key,
      size: file.size,
      filename: file.name,
    };
  } catch (error: any) {
    console.error('R2 upload error:', error);
    throw new Error(error.message || 'R2 upload failed');
  }
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return Boolean(
    R2_ACCOUNT_ID && 
    R2_ACCESS_KEY_ID && 
    R2_SECRET_ACCESS_KEY && 
    R2_BUCKET_NAME
  );
}

/**
 * Delete file from R2 (optional, requires signed request)
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  if (!isR2Configured()) {
    return false;
  }
  
  try {
    const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;
    
    const dateTime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    
    const headers: Record<string, string> = {
      "Host": `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      "x-amz-date": dateTime,
    };
    
    const authorization = await generateSignature(
      "DELETE",
      `/${R2_BUCKET_NAME}/${key}`,
      headers,
      ""
    );
    
    headers["Authorization"] = authorization;
    
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers,
    });
    
    return response.ok;
  } catch (error) {
    console.error("R2 deletion failed:", error);
    return false;
  }
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
