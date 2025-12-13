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

export default function ThoughtDetail() {
  const [, params] = useRoute("/thoughts/:slug");
  const slug = params?.slug;

  const { data: thought, isLoading, error } = useQuery<ThoughtWithAuthor>({
    queryKey: ["/api/thoughts", slug],
    enabled: !!slug,
  });

  const { data: relatedThoughts } = useQuery<ThoughtWithAuthor[]>({
    queryKey: ["/api/thoughts", { limit: 3, exclude: thought?.id }],
    enabled: !!thought,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <article className="max-w-2xl mx-auto px-6 md:px-8">
            <Skeleton className="h-6 w-24 mb-8" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-3/4 mb-8" />
            <div className="flex gap-4 mb-12">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !thought) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
            <h1 className="font-serif text-3xl font-semibold mb-4">
              Thought not found
            </h1>
            <p className="text-muted-foreground mb-8">
              This thought may have drifted away, or perhaps it was never here.
            </p>
            <Link href="/thoughts">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all thoughts
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <article className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-8">
            <Link href="/thoughts">
              <Button variant="ghost" size="sm" className="mb-8" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All thoughts
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

              {thought.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {thought.tags.map((tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <Badge
                        variant="secondary"
                        className="text-xs font-mono uppercase tracking-wide"
                      >
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
                    {thought.author.displayName?.[0] || thought.author.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {thought.author.displayName || thought.author.username}
                  </p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
            </footer>
          </div>
        </article>

        {relatedThoughts && relatedThoughts.length > 0 && (
          <section className="py-16 bg-card/50 border-t border-border">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
              <h2 className="font-serif text-2xl font-semibold mb-8">
                More Thoughts
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedThoughts.slice(0, 3).map((relatedThought) => (
                  <ThoughtCard
                    key={relatedThought.id}
                    thought={relatedThought}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
