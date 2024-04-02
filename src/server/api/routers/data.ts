import { z } from "zod"

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc"

const uniswapEndpoint = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"

const pancakeswapEndpoint = "https://api.thegraph.com/subgraphs/name/pancakeswap/exhange-eth"

const PAGE_SIZE = 25

type UniswapQueryItem = {
  token0: {
    symbol: string
  }
  token1: {
    symbol: string
  }
  id: string
  txCount: string
  volumeUSD: string
  token0Price: string
  token1Price: string
}

type PancakeSwapQueryItem = {
  token0: {
    symbol: string
  }
  token1: {
    symbol: string
  }
  id: string
  totalTransactions: string
  volumeUSD: string
  token0Price: string
  token1Price: string
}

type ResponseItem = {
  swap: string
  token0: string
  token1: string
  txCount: number
  volume: number
  amount: number
}

const whereClause = (filter: number) => {
  if (filter === 0) {
    return undefined
  }

  if (filter === 1) {
    return "{volumeUSD_lt: 1000}"
  }

  return "{volumeUSD_gte: 1000}"
}

const uniswapQuery = (page: number, filter: number, pageSize = PAGE_SIZE) => {
  const conditions = [
    `skip: ${page * pageSize}`,
    `first: ${pageSize}`,
    "orderBy: id"
  ]

  const where = whereClause(filter)

  if (where) {
    conditions.push(`where: ${where}`)
  }

  return `
    {
      pools(${conditions.join()}) {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
        txCount
        volumeUSD
        token0Price
        token1Price
      }
    }
  `
}

const pancakeswapQuery = (page: number, filter: number, pageSize = PAGE_SIZE) => {
  const conditions = [
    `skip: ${page * pageSize}`,
    `first: ${pageSize}`,
    "orderBy: id"
  ]

  const where = whereClause(filter)

  if (where) {
    conditions.push(`where: ${where}`)
  }

  return `
    {
      pairs(${conditions.join()}) {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
        volumeUSD
        totalTransactions
        token1Price
        token0Price
      }
    }
  `
}

const TTL = 300 // in sec

const cache: Record<string, { time: number, data: ResponseItem[] }> = {}

const cacheOrQuery = async (key: string, queryFn: () => Promise<ResponseItem[]>) => {
  const c = cache[key]

  if (c !== undefined) {
    if (c.time + TTL > Math.floor(Date.now() / 1000)) {
      return c.data
    }
  }

  const res = await queryFn()

  cache[key] = {
    time: Math.floor(Date.now() / 1000),
    data: res
  }

  return res
}

const queryUniswap = async (page: number, filter: number, pageSize = PAGE_SIZE): Promise<ResponseItem[]> => {
  const { data } = await fetch(uniswapEndpoint, {
    method: "POST",
    body: JSON.stringify({ query: uniswapQuery(page, filter, pageSize) })
  }).then(res => res.json()) as { data: { pools: UniswapQueryItem[] } }

  const res = data.pools.map(item => ({
    swap: "uniswap",
    token0: item.token0.symbol,
    token1: item.token1.symbol,
    txCount: Number(item.txCount),
    volume: Number(item.volumeUSD),
    amount: Number(item.token0.symbol === "WETH" ? item.token1Price : item.token0Price)
  }))

  return res
}

const queryPancakeSwap = async (page: number, filter: number, pageSize = PAGE_SIZE): Promise<ResponseItem[]> => {
  const { data } = await fetch(pancakeswapEndpoint, {
    method: "POST",
    body: JSON.stringify({ query: pancakeswapQuery(page, filter, pageSize) })
  }).then(res => res.json()) as { data: { pairs: PancakeSwapQueryItem[] } }

  const res = data.pairs.map(item => ({
    swap: "pancakeswap",
    token0: item.token0.symbol,
    token1: item.token1.symbol,
    txCount: Number(item.totalTransactions),
    volume: Number(item.volumeUSD),
    amount: Number(item.token0.symbol === "WETH" ? item.token1Price : item.token0Price)
  }))

  return res
}

const fetchUniswap = async (page: number, filter: number, pageSize = PAGE_SIZE) =>
  cacheOrQuery(`uniswap:${page}:${filter}:${pageSize}`, () => queryUniswap(page, filter, pageSize))

const fetchPancakeSwap = async (page: number, filter: number, pageSize = PAGE_SIZE) =>
  cacheOrQuery(`pancake:${page}:${filter}:${pageSize}`, () => queryPancakeSwap(page, filter, pageSize))

export const dataRouter = createTRPCRouter({
  data: publicProcedure
    .input(z.object({ swap: z.enum(["uniswap", "pancakeswap", "all"]), filter: z.number(), page: z.number() }))
    .query(async ({ input }) => {
      const { swap, filter, page } = input

      if (swap === "uniswap") {
        return await fetchUniswap(page, filter)
      } else if (swap === "pancakeswap") {
        return await fetchPancakeSwap(page, filter)
      } else {
        const [uniswap, pancakeSwap] = await Promise.all<ResponseItem[]>([
          fetchUniswap(page, filter, 13),
          fetchPancakeSwap(page, filter, 12)]
        )

        return (uniswap ?? []).concat(pancakeSwap ?? [])
          .sort((a, b) => a.token0 > b.token0 ? 1 : a.token0 < b.token0 ? -1 : 0)
      }
    }),
})
