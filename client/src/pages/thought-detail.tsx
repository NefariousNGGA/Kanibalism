import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Clock, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThoughtCard, ThoughtCardSkeleton } from "@/components/thought-card";
import { formatDate } from "@/lib/utils";
import type { ThoughtWithAuthor } from "@shared/schema";

// Define a simple skeleton for the main content area
function ThoughtDetailSkeleton() {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-3/4 mb-4" /> {/* Title */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono mb-6">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-border">|</div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="text-border">|</div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-64 w-full mb-4" /> {/* Content area */}
        <Skeleton className="h-48 w-full" /> {/* More content area */}
      </div>
    </div>
  );
}

export default function ThoughtDetail() {
  const [, params] = useRoute("/thoughts/:slug");
  const slug = params?.slug;

  // Fetch the thought data, ensuring the query only runs if slug is available
  const { data: thought, isLoading, error } = useQuery({
    queryKey: ["/api/thoughts", slug],
    enabled: !!slug, // Only run query if slug exists
    // Optionally, add staleTime/cacheTime for better UX if data doesn't change frequently
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle loading state
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

  // Handle error or missing thought
  if (error || !thought) {
    console.error("Error fetching thought or thought not found:", error, slug); // Log for debugging
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

  // At this point, 'thought' is guaranteed to be defined due to the check above
  // Use optional chaining (?.) or provide fallbacks for nested properties just in case
  const author = thought.author || { username: "Unknown", displayName: "Unknown" }; // Fallback if author is missing
  const tags = thought.tags || []; // Fallback if tags are missing

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <article className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-8">
            <Link href="/thoughts">
              <Button variant="ghost" size="sm" className="mb-8" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" /> All thoughts
              </Button>
            </Link>
            <header className="mb-12">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-6">
                {thought.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(thought.createdAt)}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {thought.readingTime} min read
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {thought.viewCount} views
                </span>
              </div>
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
            <div className="prose prose-lg dark:prose-invert max-w-none font-serif">
              <div
                className="leading-relaxed text-foreground/90 whitespace-pre-wrap"
                style={{ lineHeight: "1.8" }}
              >
                {thought.content}
              </div>
            </div>
            <footer className="mt-16 pt-8 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {author.displayName?.[0] || author.username?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {author.displayName || author.username}
                  </p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
            </footer>
          </div>
        </article>
        {/* Optional: Related Thoughts Section */}
        {/* You can add this section back later if desired */}
        {/* <section className="py-16 bg-card/50 border-t border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            <h2 className="font-serif text-2xl font-semibold mb-8">More Thoughts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedThoughts && relatedThoughts.length > 0 ? (
                relatedThoughts.slice(0, 3).map((relatedThought) => (
                  <ThoughtCard key={relatedThought.id} thought={relatedThought} variant="compact" />
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center">No related thoughts found.</p>
              )}
            </div>
          </div>
        </section> */}
      </main>
      <Footer />
    </div>
  );
}