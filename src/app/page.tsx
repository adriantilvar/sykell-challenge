"use client";
import { useForm } from "@tanstack/react-form";
import { Info, OctagonX, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, safeTry } from "@/lib/utils";
import { UrlInfoSchema } from "./schemas.ts";

type UrlQueueItem = {
  url: string;
  status: "Created" | "Running" | "Queued" | "Cancelled" | "Done" | "Error";
};

const FetchError = {
  FetchFail: "FETCH_FAIL",
  ParseFail: "PARSE_FAIL",
  UserCancellation: "USER_CANCELLATION",
} as const;

const getUrlInfo = async (url: string, controller?: AbortController) => {
  const [urlInfo, fetchError] = await safeTry<unknown, Error | string>(
    fetch(`http://127.0.0.1:1534/url-info?url=${url}`, {
      cache: "no-store",
      signal: controller?.signal,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed with status: ${res.status}`);
      }

      return res.json();
    })
  );

  if (fetchError instanceof Error) {
    return { success: false, error: FetchError.FetchFail } as const;
  }

  if (fetchError && fetchError === FetchError.UserCancellation) {
    return { success: false, error: FetchError.UserCancellation } as const;
  }

  const { error: parseError, data } = UrlInfoSchema.safeParse(urlInfo);

  if (parseError) {
    return { success: false, error: FetchError.ParseFail } as const;
  }

  return { success: true, data } as const;
};

export default function Home() {
  const [queue, setQueue] = useState<UrlQueueItem[]>([]);
  const form = useForm({
    defaultValues: {
      url: "",
    },
    validators: {
      onSubmit: z.object({
        url: z.url({ protocol: /^https?$/, hostname: z.regexes.domain }),
      }),
    },
    onSubmit: async ({ value }) => {
      if (queue.some((item) => item.url === value.url)) {
        toast(
          <div className="flex items-center gap-2">
            <Info className="size-5" />
            <span>This URL is already in the queue</span>
          </div>
        );
        return;
      }

      setQueue((prev) => [
        ...prev,
        {
          ...value,
          status: "Created",
        } as const,
      ]);
    },
  });

  const [isFetching, setIsFetching] = useState(false);
  const fetchController = useRef<AbortController | null>(null);

  const runningItem = queue.find((item) => item.status === "Running");
  const firstQueuedItem = queue.find((item) => item.status === "Queued");

  const runAnalysis = useCallback(
    (item: UrlQueueItem) => {
      const itemIndex = queue.findIndex((q) => q.url === item.url);
      if (itemIndex === -1) return;

      setQueue((prev) => {
        const newQueue = [...prev];
        newQueue[itemIndex] = {
          ...item,
          status: runningItem ? "Queued" : "Running",
        };
        return newQueue;
      });
    },
    [queue, runningItem]
  );

  const stopAnalysis = useCallback(
    (item: UrlQueueItem, status: UrlQueueItem["status"]) => {
      const itemIndex = queue.findIndex((q) => q.url === item.url);
      if (itemIndex === -1) return;

      if (item.url === runningItem?.url && isFetching) {
        fetchController.current?.abort(FetchError.UserCancellation);
        setIsFetching(false);
      }

      setQueue((prev) => {
        const newQueue = [...prev];
        newQueue[itemIndex] = {
          ...item,
          status,
        };
        return newQueue;
      });
    },
    [queue, isFetching, runningItem?.url]
  );

  if (!runningItem && firstQueuedItem) {
    runAnalysis(firstQueuedItem);
  }

  useEffect(() => {
    if (runningItem && !isFetching) {
      const controller = new AbortController();
      fetchController.current = controller;
      setIsFetching(true);

      getUrlInfo(runningItem.url, controller).then(({ success, error }) => {
        if (runningItem.status !== "Cancelled") {
          if (success) {
            stopAnalysis(runningItem, "Done");
          }
          if (error) {
            stopAnalysis(
              runningItem,
              error === FetchError.UserCancellation ? "Cancelled" : "Error"
            );
          }
          setIsFetching(false);
        }
      });
    }

    () => {
      fetchController.current?.abort();
    };
  }, [runningItem, isFetching, stopAnalysis]);

  return (
    <main className="flex h-screen flex-col items-center">
      <div className="mt-16 flex size-full flex-col overflow-hidden px-3 sm:mt-42 sm:w-xl xl:w-2xl">
        <div>
          <h1 className="font-medium text-xl">Analyze URL</h1>
          <p>Add a URL to the queue for analysis</p>
        </div>

        <form
          className="mt-4 flex w-full flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="url">
            {(field) => (
              <div className="flex flex-1 flex-col">
                <Input
                  aria-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type="text"
                  placeholder="https://example.com"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <p className="mt-1 font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button size="sm" type="submit" disabled={!canSubmit}>
                {isSubmitting ? "..." : "Add"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        {!!queue.length && (
          <div className="mt-6 flex h-full flex-col gap-2 overflow-hidden">
            <h2 className="font-medium text-lg">URLs</h2>

            <div className="h-full overflow-scroll pb-4">
              {queue.map((item) => (
                <QueueItem
                  key={item.url}
                  item={item}
                  run={runAnalysis}
                  stop={stopAnalysis}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function QueueItem({
  item,
  run,
  stop,
}: {
  item: UrlQueueItem;
  run: (item: UrlQueueItem) => void;
  stop: (item: UrlQueueItem, status: UrlQueueItem["status"]) => void;
}) {
  return (
    <div
      key={item.url}
      className="grid grid-cols-10 gap-y-1 border not-first:border-t-0 px-3 py-2 first:rounded-t-sm last:rounded-b-sm"
    >
      <div className="col-span-10 inline-flex items-center sm:col-span-7">
        <span className="overflow-hidden truncate font-medium sm:w-90 xl:w-108">
          {item.url}
        </span>
      </div>
      <div className="col-span-3 inline-flex items-center gap-x-1 sm:col-span-2">
        <span
          className={cn("size-3 rounded-full", {
            "bg-blue-400": item.status === "Created",
            "bg-orange-400": item.status === "Running",
            "bg-yellow-400": item.status === "Queued",
            "bg-purple-400": item.status === "Cancelled",
            "bg-green-400": item.status === "Done",
            "bg-red-400": item.status === "Error",
          })}
        />
        <span>{item.status}</span>
      </div>
      <div className="col-span-1 col-start-10 flex justify-center">
        {item.status === "Running" || item.status === "Queued" ? (
          <Button
            size="icon"
            variant="ghost"
            className="text-red-800 hover:bg-red-50 hover:text-red-900"
            onClick={() => stop(item, "Cancelled")}
          >
            <OctagonX />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="text-green-800 hover:bg-green-50 hover:text-green-900"
            onClick={() => run(item)}
          >
            <Play />
          </Button>
        )}
      </div>
    </div>
  );
}
