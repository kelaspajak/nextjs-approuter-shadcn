const GHOST_CONTENT_BASE_PATH = "/ghost/api/content";
const DEFAULT_REVALIDATE_SECONDS = 60;

const ghostContentApiUrl = process.env.NEXT_PUBLIC_GHOST_CONTENT_API_URL;
const ghostContentApiKey = process.env.NEXT_PUBLIC_GHOST_CONTENT_API_KEY;

type GhostTag = {
	id: string;
	slug: string;
	name: string;
};

type GhostAuthor = {
	id: string;
	slug: string;
	name: string;
	profile_image?: string | null;
};

export type GhostPostSummary = {
	id: string;
	slug: string;
	title: string;
	excerpt?: string | null;
	feature_image?: string | null;
	published_at?: string | null;
	reading_time?: number | null;
	updated_at?: string | null;
	tags?: GhostTag[];
	authors?: GhostAuthor[];
};

export type GhostPost = GhostPostSummary & {
	html?: string | null;
	meta_title?: string | null;
	meta_description?: string | null;
	updated_at?: string | null;
};

type GhostPostsResponse<T extends GhostPost | GhostPostSummary> = {
	posts: T[];
	meta?: {
		pagination?: GhostPagination;
	};
};

export type GhostPagination = {
	page: number;
	limit: number;
	total: number;
	pages: number;
	next?: number | null;
	prev?: number | null;
};

const buildEndpoint = (
	baseUrl: string,
	pathname: string,
	params: Record<string, string | number | undefined>,
) => {
	const url = new URL(pathname, baseUrl);

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) {
			return;
		}
		url.searchParams.set(key, String(value));
	});

	return url;
};

const fetchFromGhost = async <T>(url: URL) => {
	const response = await fetch(url, {
		method: "GET",
		next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
	});

	if (!response.ok) {
		throw new Error(
			`Ghost CMS request failed: ${response.status} ${response.statusText}`,
		);
	}

	return (await response.json()) as T;
};

export const fetchGhostPosts = async (options?: {
	limit?: number;
	page?: number;
}) => {
	if (!ghostContentApiUrl || !ghostContentApiKey) {
		return { posts: [], pagination: null };
	}

	const url = buildEndpoint(
		ghostContentApiUrl,
		`${GHOST_CONTENT_BASE_PATH}/posts/`,
		{
			key: ghostContentApiKey,
			include: "tags,authors",
			fields:
				"id,slug,title,excerpt,feature_image,published_at,reading_time,updated_at",
			limit: options?.limit ?? 12,
			page: options?.page,
			order: "published_at desc",
		},
	);

	try {
		const data = await fetchFromGhost<GhostPostsResponse<GhostPostSummary>>(url);
		return {
			posts: data.posts,
			pagination: data.meta?.pagination ?? null,
		};
	} catch {
		return { posts: [], pagination: null };
	}
};

export const fetchGhostPostBySlug = async (slug: string) => {
	if (!ghostContentApiUrl || !ghostContentApiKey) {
		return null;
	}

	const url = buildEndpoint(ghostContentApiUrl, `${GHOST_CONTENT_BASE_PATH}/posts/slug/${slug}/`, {
		key: ghostContentApiKey,
		include: "tags,authors",
		formats: "html",
	});

	try {
		const data = await fetchFromGhost<GhostPostsResponse<GhostPost>>(url);
		return data.posts[0] ?? null;
	} catch {
		return null;
	}
};
