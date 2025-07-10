import { z } from "zod";
import { safeTry } from "@/lib/utils";

const UrlInfoSchema = z.object({
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

export default async function Home() {
  const baseUrl = "https://www.w3.org/TR/html401/sgml/dtd.html";

  const [fetchError, urlInfo] = await safeTry(
    fetch(`http://127.0.0.1:1534/url-info?url=${baseUrl}`, {
      cache: "no-store",
    }).then((res) => res.json())
  );

  const { error: parseError, data } = UrlInfoSchema.safeParse(urlInfo);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h1 className="bg-orange-200 px-2 py-1 text-xl">
        Page under construction
      </h1>

      {fetchError && <p>Oops, something went wrong retrieving the data</p>}
      {!fetchError && parseError && (
        <p>Oops, something went wrong parsing the data</p>
      )}
      {!parseError && !fetchError && (
        <div className="pt-2">
          <h2 className="font-medium">URL: {baseUrl}</h2>
          <p>HTML version: {data.htmlVersion} </p>
          <p>Title: {data.pageTitle}</p>
          <p>H1 count: {data.h1Count}</p>
          <p>H2 count: {data.h2Count}</p>
          <p>H3 count: {data.h3Count}</p>
          <p>H4 count: {data.h4Count}</p>
          <p>Internal links count: {data.internalLinksCount}</p>
          <p>External links count: {data.externalLinksCount}</p>
          <p>Broken links count: {data.brokenLinksCount}</p>
          <p>Has login form: {data.hasLoginForm ? "Yes" : "No"}</p>
        </div>
      )}
    </main>
  );
}
