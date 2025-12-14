import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Clock, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { formatDate } from "@/lib/utils";
import type { ThoughtWithAuthor } from "@shared/schema";

// Define a simple skeleton for the main content area
function ThoughtDetailSkeleton() {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono mb-6">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="text-border">|</div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="text-border">|</div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

// Define a type for the error state if needed, though useQuery error is usually sufficient
// type FetchError = { message: string; status?: number };

export default function ThoughtDetail() {
  const [, params] = useRoute("/thoughts/:slug");
  const slug = params?.slug;

  // --- DEBUG LOGS ADDED ---
  console.log("ThoughtDetail: Raw slug from URL params:", slug, "Type:", typeof slug);
  const decodedSlug = slug ? decodeURIComponent(slug) : slug; // Decode the slug just in case
  console.log("ThoughtDetail: Decoded slug:", decodedSlug);
  // --- END DEBUG LOGS ---

  // Define the query function inline or use a centralized API client if available
  // This function fetches the thought by its slug
  const fetchThought = async ({ queryKey }: { queryKey: [string, string | undefined] }): Promise<ThoughtWithAuthor | null> => {
    const [, slug] = queryKey;
    console.log("ThoughtDetail: Fetching thought with slug (in fetch function):", slug); // Debug log
    if (!slug) {
      throw new Error("Slug is required to fetch a thought.");
    }

    // Use the decoded slug for the API call
    const response = await fetch(`/api/thoughts/${decodedSlug}`);

    console.log("ThoughtDetail: API call made to:", `/api/thoughts/${decodedSlug}`, "Response status:", response.status); // Debug log

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`API returned 404 for slug: ${decodedSlug}`); // Debug log
        // Return null for 404 to distinguish from other errors
        return null;
      }
      // Throw a generic error for other non-2xx responses
      const errorText = await response.text(); // Get error details from response body if possible
      console.error(`API returned error ${response.status} for slug: ${decodedSlug}`, errorText); // Debug log
      throw new Error(`Failed to fetch thought: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("ThoughtDetail: API response data:", data); // Debug log
    return data;
  };

  // Use React Query to fetch the thought data
  const {
     thought,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["/api/thoughts", decodedSlug], // Query key uses the decoded slug
    queryFn: fetchThought,
    enabled: !!decodedSlug, // Only run the query if a decoded slug is present in the URL
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache data for 10 minutes
    // Refetch on window focus is disabled by default, which is usually fine.
    // You could enable it with refetchOnWindowFocus: true if needed.
  });

  console.log("ThoughtDetail: useQuery result - isLoading:", isLoading, "isError:", isError, "error:", error, "thought:", thought); // Debug log

  // Handle loading state
  if (isLoading) {
    console.log("ThoughtDetail: Showing loading skeleton"); // Debug log
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <ThoughtDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  // Handle error state (network issues, 500 errors, etc.)
  if (isError) {
    console.error("ThoughtDetail: Query Error:", error); // Log error details for debugging (visible in browser console if accessible)
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
            <Card className="p-12 border-0 bg-card">
              <h2 className="font-serif text-2xl font-semibold mb-4">Error Loading Thought</h2>
              <p className="text-muted-foreground mb-6">
                There was a problem retrieving this thought. Please try again later.
              </p>
              <Link href="/thoughts">
                <Button variant="outline">Browse All Thoughts</Button>
              </Link>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle the case where the thought was not found (API returned 404, fetchThought returned null)
  if (!thought) {
    console.warn(`Thought with decoded slug '${decodedSlug}' not found.`); // Log warning for debugging
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
            <Card className="p-12 border-0 bg-card">
              <h2 className="font-serif text-2xl font-semibold mb-4">Thought Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The thought you are looking for may have been removed or the link might be incorrect.
              </p>
              <Link href="/thoughts">
                <Button variant="outline">Browse All Thoughts</Button>
              </Link>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If we reach here, the thought data is successfully loaded and not null.
  console.log("ThoughtDetail: Rendering thought with data:", thought); // Debug log
  const { title, content, author, tags, createdAt, readingTime, viewCount } = thought;

  // Provide fallbacks for potentially missing author details
  const authorName = author?.displayName || author?.username || "Anonymous";
  const authorInitial = (authorName[0] || "?").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <article className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-8">
            {/* Back Button */}
            <Link href="/thoughts">
              <Button variant="ghost" size="sm" className="mb-8" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" /> All thoughts
              </Button>
            </Link>

            {/* Header Section (Title, Meta, Tags) */}
            <header className="mb-12">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-6">
                {title || "Untitled Thought"} {/* Fallback if title is somehow missing */}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(createdAt)}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTime || 0} min read
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {viewCount || 0} views
                </span>
              </div>
              {/* Render Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <Badge variant="secondary" className="text-xs font-mono uppercase tracking-wide">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {/* Main Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none font-serif">
              <div
                className="leading-relaxed text-foreground/90 whitespace-pre-wrap"
                style={{ lineHeight: "1.8" }}
              >
                {/* Render content, handling potential null/undefined */}
                {typeof content === 'string' && content.length > 0 ? content : "No content available for this thought."}
              </div>
            </div>

            {/* Footer (Author Info) */}
            <footer className="mt-16 pt-8 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {authorInitial}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {authorName}
                  </p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
            </footer>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}