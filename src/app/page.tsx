type UrlInfo = {
  id: string;
  htmlVersion: string;
  pageTitle: string;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  internalLinksCount: number;
  externalLinksCount: number;
  brokenLinksCount: number;
  hasLoginForm: boolean;
};

export default async function Home() {
  // TODO: Validate response
  const urls = await fetch("http://127.0.0.1:1534/urls", {
    cache: "no-store",
  }).then((res) => res.json());

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h1 className="bg-orange-200 px-2 py-1 text-xl">
        Page under construction
      </h1>

      <ul>
        {urls.map((url: UrlInfo) => (
          <li key={url.id}>{url.pageTitle}</li>
        ))}
      </ul>
    </main>
  );
}
