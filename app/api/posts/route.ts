import { NextResponse } from "next/server";

import { POSTS_PAGE_SIZE } from "@/lib/constants";
import { fetchGhostPosts } from "@/lib/ghost";

const parsePositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parsePositiveInteger(url.searchParams.get("page"), 1);
  const limitParam = parsePositiveInteger(url.searchParams.get("limit"), POSTS_PAGE_SIZE);
  const limit = Math.min(limitParam, POSTS_PAGE_SIZE);

  try {
    const { posts, pagination } = await fetchGhostPosts({ limit, page });

    return NextResponse.json({ posts, pagination });
  } catch {
    return NextResponse.json({ posts: [], pagination: null }, { status: 500 });
  }
}
