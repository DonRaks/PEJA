import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from './constants';
import { MediaItem } from './types';
import { getSupabaseAdminClient } from './supabase';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create upload directory', err);
  }
}

/**
 * Validates buffer magic bytes against common image formats
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string } {
  if (buffer.length < 12) return { valid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // WEBP: RIFF .... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, detectedMime: 'image/webp' };
  }

  // AVIF: ....ftypavif
  const ftyp = buffer.toString('ascii', 4, 12);
  if (ftyp.includes('ftypavif') || ftyp.includes('ftypavis')) {
    return { valid: true, detectedMime: 'image/avif' };
  }

  return { valid: false };
}

/**
 * Upload single file to storage (Supabase or local persistent storage)
 */
export async function saveMediaFile(
  fileBuffer: Buffer,
  originalFilename: string,
  declaredMimeType: string,
  altText: string = ''
): Promise<MediaItem> {
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size ${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB exceeds maximum allowed 10MB.`);
  }

  const { valid, detectedMime } = validateImageMagicBytes(fileBuffer);
  if (!valid) {
    throw new Error('Invalid file format. Uploaded file is not a valid JPEG, PNG, WEBP, or AVIF image.');
  }

  const mime = detectedMime || declaredMimeType;
  if (!ALLOWED_IMAGE_TYPES.includes(mime)) {
    throw new Error(`Unsupported image MIME type: ${mime}`);
  }

  const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
  const fileId = crypto.randomUUID();
  const filename = `${fileId}.${ext}`;

  // Check if Supabase Storage is configured
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { error: uploadError } = await supabase.storage
        .from('peja-media')
        .upload(`uploads/${filename}`, fileBuffer, {
          contentType: mime,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Supabase upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('peja-media')
        .getPublicUrl(`uploads/${filename}`);

      return {
        id: fileId,
        url: publicUrlData.publicUrl,
        alt: altText || originalFilename.replace(/\.[^/.]+$/, ''),
        order: 0,
        fileSize: fileBuffer.length,
        mimeType: mime,
      };
    } catch (err) {
      console.warn('Supabase storage upload error, falling back to local persistent storage:', err);
    }
  }

  // Fallback / standard persistent local storage
  await ensureUploadDir();
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, fileBuffer);

  return {
    id: fileId,
    url: `/uploads/${filename}`,
    alt: altText || originalFilename.replace(/\.[^/.]+$/, ''),
    order: 0,
    fileSize: fileBuffer.length,
    mimeType: mime,
  };
}

/**
 * Delete media file
 */
export async function deleteMediaFile(url: string): Promise<boolean> {
  if (url.startsWith('/uploads/')) {
    const filename = path.basename(url);
    const filePath = path.join(UPLOAD_DIR, filename);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
