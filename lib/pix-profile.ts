import type { Tables } from "@/lib/database.types";
import type { PixProfile } from "@/components/payments/pix-charge-dialog";

/** Lê os campos de recebimento do perfil, ou null se não houver chave. */
export function readPixProfile(profile: Tables<"profiles"> | null): PixProfile {
  if (!profile?.pix_key || !profile.pix_key_type) return null;

  return {
    key: profile.pix_key,
    keyType: profile.pix_key_type,
    name: profile.pix_name ?? "Recebedor",
    city: profile.pix_city ?? "Brasil",
  };
}
