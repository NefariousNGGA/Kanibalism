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
  const slug = params?.slug;

  console.log("ThoughtDetail: Slug extracted:", slug); // Debug log

  const {  thought, isLoading, error, isFetching } = useQuery({
    queryKey: ["/api/thoughts", slug],
    enabled: !!slug, // Only run query if slug exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  console.log("ThoughtDetail: Query state - isLoading:", isLoading, "isFetching:", isFetching, "error:", error, "thought (type):", typeof thought, "thought (value):", thought); // Debug log

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

  // Check for error from the query *or* if thought is still undefined after loading completes
  if (error || (typeof thought === 'undefined')) {
    console.error("ThoughtDetail: Query Error or thought is undefined:", error, slug); // Log the error object and slug
    // Log the error's message and stack if available
    if (error) {
      console.error("ThoughtDetail: Error details - message:", (error as any).message || 'No message', "stack:", (error as any).stack || 'No stack');
    }
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

  // Check if thought is null (separate check)
  if (!thought) {
     console.error("ThoughtDetail: Thought is null after loading/error checks:", slug); // Log for debugging
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

  // If we get here, 'thought' is an object.
  console.log("ThoughtDetail: Rendering thought:", thought.title); // Debug log

  // Use optional chaining or provide fallbacks for nested properties just in case
  const author = thought.author || { username: "Unknown", displayName: "Unknown" };
  const tags = thought.tags || [];

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
                {thought.title || "Untitled Thought"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(thought.createdAt || new Date())}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {thought.readingTime || 0} min read
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {thought.viewCount || 0} views
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
                {thought.content} {/* Render content directly, if it's null/undefined, it will be blank, not "No content available." */}
              </div>
            </div>
            <footer className="mt-16 pt-8 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {author.displayName?.[0]?.toUpperCase() || author.username?.[0]?.toUpperCase() || "?"}
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
      </main>
      <Footer />
    </div>
  );
}