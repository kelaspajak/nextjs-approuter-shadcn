import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { fetchGhostPostBySlug } from "@/lib/ghost";

const ghostContentApiUrl = process.env.NEXT_PUBLIC_GHOST_CONTENT_API_URL;
const ghostContentApiKey = process.env.NEXT_PUBLIC_GHOST_CONTENT_API_KEY;
const isGhostConfigured = Boolean(ghostContentApiUrl && ghostContentApiKey);

type PageParams = {
	slug: string;
};

type PageProps = {
	params: Promise<PageParams>;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

const formatDate = (iso?: string | null) => {
	if (!iso) {
		return null;
	}

	return dateFormatter.format(new Date(iso));
};

export const revalidate = 60;

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
	if (!isGhostConfigured) {
		return {
			title: "Ghost CMS Blog",
			description: "Configure Ghost credentials to enable blog content.",
		};
	}

	const { slug } = await params;
	const post = await fetchGhostPostBySlug(slug);

	if (!post) {
		return {
			title: "Post not found",
		};
	}

	return {
		title: post.meta_title ?? post.title,
		description: post.meta_description ?? post.excerpt ?? undefined,
	};
};

const renderTags = (tags?: { id: string; name: string }[]) => {
	if (!tags?.length) {
		return null;
	}

	return (
		<ul className="flex flex-wrap gap-2">
			{tags.map((tag) => (
				<li
					key={tag.id}
					className="rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
				>
					{tag.name}
				</li>
			))}
		</ul>
	);
};

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params;
	const post = await fetchGhostPostBySlug(slug);

	if (!post || !post.slug) {
		if (!isGhostConfigured) {
			return (
				<main className="flex min-h-screen items-center justify-center bg-background px-6 py-24 text-center text-foreground">
					<div className="space-y-4">
						<h1 className="text-3xl font-semibold">Ghost CMS not configured</h1>
						<p className="text-base text-muted-foreground">
							Set the Ghost Content API credentials to display blog posts.
						</p>
					</div>
				</main>
			);
		}

		return (
			<main className="flex min-h-screen items-center justify-center bg-background px-6 py-24 text-center text-foreground">
				<div className="space-y-4">
					<h1 className="text-3xl font-semibold">Post not found</h1>
					<p className="text-base text-muted-foreground">
						We couldn&rsquo;t find the article you&rsquo;re looking for.
					</p>
				</div>
			</main>
		);
	}

	const publishedDate = formatDate(post.published_at);
	const updatedDate = formatDate(post.updated_at);
	const authors = post.authors?.map((author) => author.name).join(", ");

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16 sm:px-10">
				<Link
					href="/"
					className="text-sm font-medium text-primary hover:underline"
				>
					← Back to all posts
				</Link>
				<header className="space-y-4">
					{renderTags(post.tags)}
					<h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
						{post.title}
					</h1>
					<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
						{authors ? <span>By {authors}</span> : null}
						{publishedDate ? <time dateTime={post.published_at ?? undefined}>{publishedDate}</time> : null}
						{updatedDate ? <span>Updated {updatedDate}</span> : null}
					</div>
				</header>
				{post.feature_image ? (
					<figure className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border">
						<Image
							src={post.feature_image}
							alt={post.title}
							fill
							className="object-cover"
							sizes="(min-width: 1024px) 80vw, 100vw"
							priority
						/>
					</figure>
				) : null}
				{post.excerpt ? (
					<p className="text-lg text-muted-foreground">{post.excerpt}</p>
				) : null}
				<article
					className="space-y-6 text-base leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:mt-10 [&_h2]:text-3xl [&_h3]:mt-8 [&_h3]:text-2xl prose-base prose text-gray-700 prose-h3:text-black prose-a:font-semibold prose-a:text-accent-300 hover:prose-a:text-black"
					dangerouslySetInnerHTML={{ __html: post.html ?? "" }}
				/>
			</div>
		</main>
	);
}
