import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThoughtCard, ThoughtCardSkeleton } from "@/components/thought-card";
import type { ThoughtWithAuthor, Tag } from "@shared/schema";

export default function TagsPage() {
  const [, params] = useRoute("/tags/:slug");
  const slug = params?.slug;

  const { data: tag } = useQuery<Tag>({
    queryKey: ["/api/tags", slug],
    enabled: !!slug,
  });

  const { data: thoughts, isLoading } = useQuery<ThoughtWithAuthor[]>({
    queryKey: ["/api/thoughts", { tag: slug }],
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <Link href="/thoughts">
            <Button variant="ghost" size="sm" className="mb-8" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All thoughts
            </Button>
          </Link>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <TagIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold">
                {tag?.name || slug}
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {thoughts?.length || 0} thought{thoughts?.length !== 1 ? "s" : ""} tagged with this topic.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <ThoughtCardSkeleton />
                <ThoughtCardSkeleton />
                <ThoughtCardSkeleton />
              </>
            ) : thoughts && thoughts.length > 0 ? (
              thoughts.map((thought) => (
                <ThoughtCard key={thought.id} thought={thought} />
              ))
            ) : (
              <Card className="col-span-full p-12 text-center border-0 bg-card">
                <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold mb-2">
                  No thoughts with this tag
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  This tag is waiting for its first thought.
                </p>
                <Link href="/thoughts">
                  <Button variant="outline">
                    Browse all thoughts
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
