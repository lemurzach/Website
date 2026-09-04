import { z } from "zod";

export const heroSchema = z.object({
  rank: z.coerce.number().int().min(1, "Rank must be 1 or higher"),
  name: z.string().trim().min(1, "Real name is required"),
  heroName: z.string().trim().min(1, "Hero name is required"),
  quirk: z.string().trim().min(1, "Quirk name is required"),
  quirkDescription: z.string().trim().min(1, "Quirk description is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  imageUrl: z
    .union([z.url("Must be a valid URL"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  agency: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  status: z.enum(["ACTIVE", "RETIRED", "MISSING"]),
});

export type HeroInput = z.infer<typeof heroSchema>;

export const villainSchema = z.object({
  name: z.string().trim().min(1, "Real name is required"),
  alias: z.string().trim().min(1, "Alias is required"),
  quirk: z.string().trim().min(1, "Quirk name is required"),
  quirkDescription: z.string().trim().min(1, "Quirk description is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  imageUrl: z
    .union([z.url("Must be a valid URL"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  bounty: z.coerce.number().int().min(0, "Bounty can't be negative"),
  dangerLevel: z.enum(["LOW", "MODERATE", "HIGH", "EXTREME"]),
  status: z.enum(["AT_LARGE", "CAPTURED"]),
  lastKnownLocation: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type VillainInput = z.infer<typeof villainSchema>;
