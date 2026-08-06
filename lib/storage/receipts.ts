import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAllowedReceiptFile } from "@/lib/validations/expense";

const BUCKET = "expense-receipts";
const SIGNED_URL_SECONDS = 120;

export function sanitizeFileName(originalName: string): string {
  const base = originalName.split(/[/\\]/).pop() ?? "file";
  const cleaned = base
    .replace(/[^\w.\u3040-\u30ff\u3400-\u9fff-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 120);
  return cleaned.length > 0 ? cleaned : "receipt";
}

export function buildReceiptPath(userId: string, fileName: string): string {
  const safe = sanitizeFileName(fileName);
  return `${userId}/${crypto.randomUUID()}/${safe}`;
}

export async function uploadReceipt(
  userId: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  if (!isAllowedReceiptFile(file)) {
    return {
      error:
        "領収書は JPEG / PNG / WebP / PDF（10MB以下）のみアップロードできます。",
    };
  }

  const path = buildReceiptPath(userId, file.name);
  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Receipt upload failed", { code: error.message });
    return { error: "領収書のアップロードに失敗しました。" };
  }

  return { path };
}

export async function createReceiptSignedUrl(
  path: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("Signed URL failed", { code: error?.message });
    return null;
  }

  return data.signedUrl;
}

/** Compensating delete for unused uploads after failed insert/RPC. */
export async function deleteReceiptAdmin(path: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error("Compensating receipt delete failed", {
        code: error.message,
      });
    }
  } catch (err) {
    console.error("Compensating receipt delete threw", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}
