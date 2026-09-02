import crypto from 'crypto';
import { config } from '../config';
import { AppError } from '../types';

export interface SignedUrlOptions {
  fileKey: string;
  orgId: string;
  action: 'read' | 'write';
  expiresInSeconds?: number;
}

export interface SignedUrlResult {
  url: string;
  fileKey: string;
  expiresAt: string;
  signature: string;
}

/**
 * Generates a tamper-proof cryptographically signed time-limited URL for secure file access/upload
 */
export function generateSignedUrl(options: SignedUrlOptions): SignedUrlResult {
  const expiresIn = options.expiresInSeconds || config.storage.signedUrlExpiresIn;
  const expiresAtMs = Date.now() + expiresIn * 1000;
  const expiresAtIso = new Date(expiresAtMs).toISOString();

  // Create HMAC payload
  const payload = `${options.orgId}:${options.fileKey}:${options.action}:${expiresAtMs}`;
  const signature = crypto
    .createHmac('sha256', config.jwt.secret)
    .update(payload)
    .digest('hex');

  const baseUrl = `/api/v1/files/download/${options.fileKey}`;
  const signedUrl = `${baseUrl}?orgId=${encodeURIComponent(options.orgId)}&expires=${expiresAtMs}&action=${options.action}&sig=${signature}`;

  return {
    url: signedUrl,
    fileKey: options.fileKey,
    expiresAt: expiresAtIso,
    signature,
  };
}

/**
 * Validates a signed URL signature and expiration
 */
export function verifySignedUrl(
  fileKey: string,
  orgId: string,
  action: string,
  expiresMsStr: string,
  signature: string
): boolean {
  const expiresAtMs = parseInt(expiresMsStr, 10);
  if (isNaN(expiresAtMs) || Date.now() > expiresAtMs) {
    throw new AppError('Signed URL has expired. Please request a fresh signed link.', 401, 'SIGNED_URL_EXPIRED');
  }

  const payload = `${orgId}:${fileKey}:${action}:${expiresAtMs}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.jwt.secret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new AppError('Invalid signed URL signature. URL tampering detected.', 403, 'INVALID_SIGNATURE');
  }

  return true;
}
