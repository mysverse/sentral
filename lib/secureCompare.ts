import { createHash, timingSafeEqual } from "node:crypto";

// Hash both inputs before comparing so timingSafeEqual never throws on
// length mismatch and comparison time stays independent of the secret.
export function secureCompare(
  candidate: string | null | undefined,
  expected: string
): boolean {
  if (!candidate) {
    return false;
  }
  const candidateDigest = createHash("sha256").update(candidate).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(candidateDigest, expectedDigest);
}
