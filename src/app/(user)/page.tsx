"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { formatNumber } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import Image from "next/image";

const Page = () => {
  const [swap, setSwap] = useState<"uniswap" | "pancakeswap" | "all">("all");

  const [filter, setFilter] = useState("0");

  const [page, setPage] = useState(0);

  const { toast } = useToast();

  const {
    data: d,
    isFetching,
    refetch,
  } = api.data.data.useQuery(
    {
      swap,
      filter: Number(filter),
      page,
    },
    { enabled: false },
  );

  const [data, setData] = useState<NonNullable<typeof d>>([]);

  useEffect(() => {
    setPage(0);
    setData([]);
    refetch()
      .then((res) => res.data && setData(res.data))
      .catch((e) =>
        toast({
          title: "Failed to fetch data",
          description: JSON.stringify(e),
        }),
      );
  }, [refetch, swap, filter, toast]);

  useEffect(() => {
    refetch()
      .then((res) => res.data && setData(res.data))
      .catch((e) =>
        toast({
          title: "Failed to fetch data",
          description: JSON.stringify(e),
        }),
      );
  }, [refetch, toast, page]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-row flex-wrap gap-2">
        <Tabs
          defaultValue="all"
          className="flex-1"
          onValueChange={(value) => setSwap(value as typeof swap)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="uniswap">Uniswap</TabsTrigger>
            <TabsTrigger value="pancakeswap">Pancakeswap</TabsTrigger>
          </TabsList>
        </Tabs>
        <label className="flex items-center gap-4">
          Filter by volume
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by volume" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All</SelectItem>
              <SelectItem value="1">Less than 1k</SelectItem>
              <SelectItem value="2">Greater than or equal to 1k</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
      <div className="relative flex flex-1 flex-col space-y-2 rounded-xl border-2 border-solid border-gray-50 p-4 shadow-lg">
        <div className="flex gap-4 font-bold">
          <div className="flex-1 text-left">TOKEN</div>
          <div className="w-24 text-right">AMOUNT</div>
          <div className="w-24 text-right">TXNS</div>
          <div className="w-24 text-right">VOLUME</div>
        </div>
        <hr />
        <div className="h-0 flex-grow space-y-1 overflow-auto">
          {data.map((record, key) => (
            <div
              key={key}
              className="flex items-center gap-4 hover:bg-gray-100"
            >
              <div className="flex flex-1 items-center text-left">
                <Image
                  src={
                    record.swap === "uniswap"
                      ? "https://cryptologos.cc/logos/uniswap-uni-logo.png"
                      : "https://cryptologos.cc/logos/pancakeswap-cake-logo.png"
                  }
                  alt="swap-logo"
                  className="mr-1"
                  width={24}
                  height={24}
                />
                {record.token0.slice(0, 10)} / {record.token1.slice(0, 10)}
              </div>
              <div className="w-24 text-right">
                {formatNumber(record.amount)}
              </div>
              <div className="w-24 text-right">
                {formatNumber(record.txCount)}
              </div>
              <div className="w-24 text-right">
                {formatNumber(record.volume)}
              </div>
            </div>
          ))}
        </div>
        {isFetching && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex h-full overflow-hidden">
            <Loader2 className="m-auto h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          disabled={page === 0 || isFetching}
          onClick={() => setPage((prev) => prev - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span>Page {page + 1}</span>
        <Button
          variant="outline"
          size="icon"
          disabled={isFetching}
          onClick={() => setPage((prev) => prev + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Page;
