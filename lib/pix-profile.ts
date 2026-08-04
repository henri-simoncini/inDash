import type { PixKeyType } from "@/lib/pix";
import type { PixProfile } from "@/components/payments/pix-charge-dialog";

/**
 * Lê os campos de recebimento do perfil.
 *
 * O cast existe porque os tipos gerados do Supabase só passam a conhecer
 * essas colunas depois que a migration for aplicada — trocar por
 * `Tables<"profiles">` assim que os tipos forem regerados.
 */
type ProfilePixRow = {
  pix_key: string | null;
  pix_key_type: string | null;
  pix_name: string | null;
  pix_city: string | null;
};

export function readPixProfile(profile: unknown): PixProfile {
  const row = profile as ProfilePixRow | null;
  if (!row?.pix_key || !row.pix_key_type) return null;

  return {
    key: row.pix_key,
    keyType: row.pix_key_type as PixKeyType,
    name: row.pix_name ?? "Recebedor",
    city: row.pix_city ?? "Brasil",
  };
}
