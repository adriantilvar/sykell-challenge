"use client";
import { useForm } from "@tanstack/react-form";
import { Info, ListVideo, OctagonX, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import env from "@/env/client";
import { UrlInfoSchema } from "@/lib/schemas.ts";
import { cn, safeTry } from "@/lib/utils";

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
    fetch(`${env.NEXT_PUBLIC_API_BASE_URL}?url=${url}`, {
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

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

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
      <div className="mt-16 flex size-full flex-col overflow-hidden px-3 sm:mt-32 sm:w-xl xl:w-2xl">
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
            <div className="flex h-9 items-center justify-between">
              <h2 className="font-medium text-lg">URLs</h2>

              {selectedIndices.length > 0 && (
                <div className="space-x-1">
                  <Button
                    size="sm"
                    className="border-blue-600 bg-blue-200 text-blue-950 hover:bg-blue-300/80"
                    onClick={() => {
                      const updatedQueue = queue;

                      selectedIndices.forEach((i) => {
                        updatedQueue[i] = {
                          ...updatedQueue[i],
                          status: "Queued",
                        };
                      });

                      setQueue(updatedQueue);
                      setSelectedIndices([]);
                    }}
                  >
                    <ListVideo /> Run
                  </Button>
                  <Button
                    size="sm"
                    className="border-red-600 bg-red-200 text-red-900 hover:bg-red-300/80"
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="h-full overflow-scroll pb-4">
              {queue.map((item, index) => (
                <QueueItem
                  key={item.url}
                  item={item}
                  isChecked={selectedIndices.includes(index)}
                  onChecked={(isChecked) => {
                    if (isChecked) {
                      setSelectedIndices((prev) => [...prev, index]);
                    } else
                      setSelectedIndices((prev) =>
                        prev.filter((x) => x !== index)
                      );
                  }}
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
  isChecked,
  onChecked,
  run,
  stop,
}: {
  item: UrlQueueItem;
  isChecked: boolean;
  onChecked?: (isChecked: boolean) => void;
  run: (item: UrlQueueItem) => void;
  stop: (item: UrlQueueItem, status: UrlQueueItem["status"]) => void;
}) {
  return (
    <div
      key={item.url}
      className="grid grid-cols-10 items-center gap-y-1 border not-first:border-t-0 px-3 py-2 first:rounded-t-sm last:rounded-b-sm sm:grid-cols-16"
    >
      <Checkbox
        id={item.url}
        className="col-start-1 row-start-1"
        checked={isChecked}
        onCheckedChange={onChecked}
      />

      <div className="col-span-9 col-start-2 row-start-1 truncate font-medium sm:col-span-11">
        {item.url}
      </div>
      <div className="col-span-3 row-start-2 inline-flex items-center gap-x-1 sm:col-span-3 sm:row-start-1 sm:justify-self-center">
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

      <div className="col-start-10 row-start-2 justify-self-center sm:col-start-16 sm:row-start-1">
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
