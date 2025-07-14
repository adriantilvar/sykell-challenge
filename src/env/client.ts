import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string(),
});

let env: z.infer<typeof EnvSchema>;

try {
  // biome-ignore lint/style/noProcessEnv: Will only use it here for the client
  env = EnvSchema.parse(process.env);
} catch (e) {
  const error = e as z.ZodError;

  console.error("Failed loading environment variables:");
  console.error(z.prettifyError(error));
  process.exit(1);
}

export default env;
