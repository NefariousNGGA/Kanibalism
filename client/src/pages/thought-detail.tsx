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

// --- Simple Skeleton ---
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

export default function ThoughtDetail() {
  const [, params] = useRoute("/thoughts/:slug");
  const slug = params?.slug; // Raw slug from URL

  // Fetch function for React Query
  const fetchThought = async (): Promise<ThoughtWithAuthor | null> => {
    if (!slug) {
      throw new Error("No slug provided");
    }
    // Use the raw slug directly for the API call. Let's assume the backend handles encoding correctly.
    const response = await fetch(`/api/thoughts/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Signal that the thought was not found
      }
      // Throw error for other status codes (e.g., 500)
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  };

  // Execute the query
  const { data: thought, isLoading, error, isError } = useQuery({
    queryKey: ["/api/thoughts", slug], // Use raw slug in key
    queryFn: fetchThought,
    enabled: !!slug, // Only run if slug exists
    staleTime: 0, // Always re-fetch on navigation for latest data
    cacheTime: 0, // Don't cache empty results for 404s potentially
  });

  // --- Render Logic ---

  // 1. Loading State
  if (isLoading) {
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

  // 2. Error State (e.g., network issue, 500 error)
  if (isError) {
    console.error("ThoughtDetail fetch error:", error); // Log for potential debugging
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
            <Card className="p-12 border-0 bg-card">
              <h2 className="font-serif text-2xl font-semibold mb-4">Error Loading Thought</h2>
              <p className="text-muted-foreground mb-6">
                Could not load the thought. Please check the URL or try again later.
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

  // 3. Not Found State (API returned 404, fetchThought returned null)
  if (!thought) {
    console.warn(`Thought with slug '${slug}' not found.`); // Log for potential debugging
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

  // 4. Success State - Render the thought
  // Destructure thought properties with fallbacks
  const { title = "Untitled", content = "", author, tags = [], createdAt, readingTime = 0, viewCount = 0 } = thought;

  // Safely get author info
  const authorName = author?.displayName || author?.username || "Anonymous";
  const authorInitial = authorName.charAt(0).toUpperCase() || "?";

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

            {/* Header Section */}
            <header className="mb-12">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-6">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(createdAt)}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTime} min read
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {viewCount} views
                </span>
              </div>
              {/* Tags */}
              {tags.length > 0 && (
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
                {content} {/* Render content directly, relying on API to provide string or empty string */}
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