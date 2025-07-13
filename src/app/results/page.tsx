import type { UrlInfo } from "@/lib/schemas.ts";
import { columns } from "./columns.tsx";
import { DataTable } from "./data-table.tsx";

async function getData(): Promise<UrlInfo[]> {
  return [
    {
      baseUrl: "https://example.com",
      htmlVersion: "HTML5",
      pageTitle: "Example Page",
      h1Count: 1,
      h2Count: 2,
      h3Count: 0,
      h4Count: 0,
      internalLinksCount: 5,
      externalLinksCount: 3,
      brokenLinks: [{ url: "https://example.com/broken1", statusCode: 404 }],
      hasLoginForm: false,
    },
    {
      baseUrl: "https://another.com",
      htmlVersion: "HTML4",
      pageTitle: "Another Example Page",
      h1Count: 2,
      h2Count: 1,
      h3Count: 0,
      h4Count: 0,
      internalLinksCount: 10,
      externalLinksCount: 4,
      brokenLinks: [],
      hasLoginForm: true,
    },
    {
      baseUrl: "https://sample.com",
      htmlVersion: "HTML5",
      pageTitle: "Sample Site",
      h1Count: 1,
      h2Count: 3,
      h3Count: 2,
      h4Count: 0,
      internalLinksCount: 8,
      externalLinksCount: 2,
      brokenLinks: [],
      hasLoginForm: false,
    },
    {
      baseUrl: "https://demo.com",
      htmlVersion: "HTML5",
      pageTitle: "Demo Landing",
      h1Count: 1,
      h2Count: 2,
      h3Count: 1,
      h4Count: 1,
      internalLinksCount: 6,
      externalLinksCount: 1,
      brokenLinks: [
        { url: "https://demo.com/broken1", statusCode: 404 },
        { url: "https://demo.com/broken2", statusCode: 500 },
      ],
      hasLoginForm: true,
    },
    {
      baseUrl: "https://portfolio.com",
      htmlVersion: "HTML4",
      pageTitle: "Portfolio",
      h1Count: 1,
      h2Count: 1,
      h3Count: 2,
      h4Count: 0,
      internalLinksCount: 12,
      externalLinksCount: 5,
      brokenLinks: [],
      hasLoginForm: false,
    },
    {
      baseUrl: "https://blog.com",
      htmlVersion: "HTML5",
      pageTitle: "Blog Post",
      h1Count: 1,
      h2Count: 4,
      h3Count: 0,
      h4Count: 0,
      internalLinksCount: 7,
      externalLinksCount: 3,
      brokenLinks: [{ url: "https://blog.com/broken1", statusCode: 404 }],
      hasLoginForm: false,
    },
    {
      baseUrl: "https://contact.com",
      htmlVersion: "HTML4",
      pageTitle: "Contact Us",
      h1Count: 1,
      h2Count: 1,
      h3Count: 0,
      h4Count: 0,
      internalLinksCount: 3,
      externalLinksCount: 2,
      brokenLinks: [],
      hasLoginForm: true,
    },
    {
      baseUrl: "https://services.com",
      htmlVersion: "HTML5",
      pageTitle: "Services",
      h1Count: 1,
      h2Count: 2,
      h3Count: 1,
      h4Count: 1,
      internalLinksCount: 9,
      externalLinksCount: 4,
      brokenLinks: [{ url: "https://services.com/broken1", statusCode: 404 }],
      hasLoginForm: false,
    },
    {
      baseUrl: "https://about.com",
      htmlVersion: "HTML5",
      pageTitle: "About Us",
      h1Count: 1,
      h2Count: 2,
      h3Count: 0,
      h4Count: 0,
      internalLinksCount: 5,
      externalLinksCount: 1,
      brokenLinks: [],
      hasLoginForm: false,
    },
    {
      baseUrl: "https://faq.com",
      htmlVersion: "HTML4",
      pageTitle: "FAQ",
      h1Count: 1,
      h2Count: 3,
      h3Count: 1,
      h4Count: 0,
      internalLinksCount: 4,
      externalLinksCount: 2,
      brokenLinks: [{ url: "https://faq.com/broken1", statusCode: 404 }],
      hasLoginForm: false,
    },
    {
      baseUrl: "https://pricing.com",
      htmlVersion: "HTML5",
      pageTitle: "Pricing",
      h1Count: 1,
      h2Count: 2,
      h3Count: 0,
      h4Count: 0,
      internalLinksCount: 6,
      externalLinksCount: 3,
      brokenLinks: [],
      hasLoginForm: true,
    },
  ];
}

export default async function ResultsPage() {
  const data = await getData();

  return (
    <main className="container mx-auto px-3">
      <div className="mt-16 sm:mt-32">
        <div>
          <h1 className="font-medium text-xl">Results</h1>
          <p>The results for the successful analyses</p>
        </div>
        <DataTable columns={columns} data={data} className="mt-2 max-w-300" />
      </div>
    </main>
  );
}
