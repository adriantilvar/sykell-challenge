import z from "zod";

export const UrlInfoSchema = z.object({
  baseUrl: z.string(),
  htmlVersion: z.string(),
  pageTitle: z.string(),
  h1Count: z.number(),
  h2Count: z.number(),
  h3Count: z.number(),
  h4Count: z.number(),
  internalLinksCount: z.number(),
  externalLinksCount: z.number(),
  brokenLinksCount: z.number(),
  hasLoginForm: z.boolean(),
});

export type UrlInfo = z.infer<typeof UrlInfoSchema>;
