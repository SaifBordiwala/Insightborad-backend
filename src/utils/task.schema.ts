import { z } from "zod";

export const aiTaskSchema = z.object({
  id: z.string(),
  dependencies: z.array(z.string()),
  priority: z.enum(["low", "medium", "high"]),
});

export type AiTask = z.infer<typeof aiTaskSchema>;

export const parseAiTask = (input: unknown): AiTask => {
  // Will throw a ZodError if validation fails
  return aiTaskSchema.parse(input);
};
