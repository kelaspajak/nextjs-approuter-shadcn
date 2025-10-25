"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { POSTS_PAGE_SIZE } from "@/lib/constants";
import type { GhostPagination, GhostPostSummary } from "@/lib/ghost";
import menuAssistantLight from "@/public/menu-assistant-light.jpg";
import { Calendar } from "lucide-react";

type PostsResponse = {
	posts: GhostPostSummary[];
	pagination: GhostPagination | null;
};

type PostsFeedProps = {
	initialPosts: GhostPostSummary[];
	initialPage: number;
	totalPages: number;
};

const formatPublishedDate = (value?: string | null) => {
	if (!value) {
		return null;
	}

	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
	}).format(new Date(value));
};

export function PostsFeed({
	initialPosts,
	initialPage,
	totalPages,
}: PostsFeedProps) {
	const [posts, setPosts] = useState(initialPosts);
	const [page, setPage] = useState(initialPage);
	const [pages, setPages] = useState(totalPages);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const hasMore = page < pages;

	const handleLoadMore = async () => {
		if (!hasMore || isLoading) {
			return;
		}

		setIsLoading(true);
		setError(null);

		const nextPage = page + 1;

		try {
			const response = await fetch(
				`/api/posts?page=${nextPage}&limit=${POSTS_PAGE_SIZE}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch posts");
			}

			const data = (await response.json()) as PostsResponse;

			if (data.posts.length === 0) {
				const fallbackPage = Math.max(nextPage - 1, page);
				setPages(fallbackPage);
				setPage(fallbackPage);
				return;
			}

			setPosts((current) => [...current, ...data.posts]);
			setPage(data.pagination?.page ?? nextPage);
			setPages((current) => data.pagination?.pages ?? current);
		} catch {
			setError("Unable to load more posts. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='space-y-8'>
			<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-2'>
				
				{posts.map((post) => {
					const publishedAt = formatPublishedDate(post.published_at);
					const tags = post.tags?.map((tag) => tag.name).filter(Boolean) ?? [];
					const coverImage = post.feature_image ?? menuAssistantLight;

					return (
						<Link key={post.id} href={`/blog/${post.slug}`} className='group'>
							<div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-4 @xl/main:grid-cols-2 min-h-fit'>
								<Card className='@container/card overflow-hidden pt-0'>
									<div className='relative aspect-[16/9] w-full overflow-hidden'>
										<Image
											src={coverImage}
											alt={post.title}
											sizes='(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw'
											fill
											className='object-cover transition duration-500 ease-out group-hover:scale-[1.03] rounded-t-xl'
											priority={false}
										/>
									</div>
									<CardHeader>
										{tags.length > 0 ? (
											<CardDescription className='flex flex-wrap gap-2'>
												{tags.map((tag) => (
													<Badge key={tag} variant='secondary'>
														{tag}
													</Badge>
												))}
											</CardDescription>
										) : null}
										<CardTitle className='text-xl font-semibold @[200px]/card:text-xl line-clamp-2'>
											{post.title}
										</CardTitle>
										<CardAction>
											{publishedAt ? (
												<Badge variant='outline' className='flex items-center gap-2'>
													<Calendar className='size-4' />
													<span>{publishedAt}</span>
												</Badge>
											) : null}
										</CardAction>
									</CardHeader>
									<CardFooter className='flex-col items-start gap-2 text-sm'>
										{post.excerpt ? (
											<p className='text-muted-foreground line-clamp-3'>{post.excerpt}</p>
										) : null}
									</CardFooter>
								</Card>
							</div>
						</Link>
					);
				})}
			</div>

			{error ? (
				<p className='text-center text-sm text-destructive'>{error}</p>
			) : null}

			{hasMore ? (
				<div className='flex justify-center'>
					<Button
						type='button'
						onClick={handleLoadMore}
						disabled={isLoading}
						className='btn w-full sm:w-auto rounded-full'
					>
						{isLoading ? "Loading..." : "Show more posts"}
					</Button>
				</div>
			) : null}
		</div>
	);
}