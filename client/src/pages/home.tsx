import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Tags, Type, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThoughtCard, ThoughtCardSkeleton } from "@/components/thought-card";
import { TagCloud } from "@/components/tag-badge";
import type { ThoughtWithAuthor, Tag, Stats } from "@shared/schema";

export default function Home() {
  const { data: thoughts, isLoading: thoughtsLoading } = useQuery<ThoughtWithAuthor[]>({
    queryKey: ["/api/thoughts", { limit: 3 }],
  });

  const { data: tags } = useQuery<Array<Tag & { count: number }>>({
    queryKey: ["/api/tags"],
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6">
              A digital space for thoughts that linger
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Too quiet for noise, too heavy for air. No algorithms, no engagement. Just words that needed to exist somewhere.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/thoughts">
                <Button size="lg" data-testid="button-explore">
                  Explore thoughts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" data-testid="button-about">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-card/50">
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold">
                Recent Thoughts
              </h2>
              <Link href="/thoughts">
                <Button variant="ghost" data-testid="link-view-all">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {thoughtsLoading ? (
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
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">
                    No thoughts yet
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    This space is waiting for its first thought. They'll appear here once they're written.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              <div className="space-y-6">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold">
                  About This Space
                </h2>
                <div className="prose prose-lg text-muted-foreground">
                  <p className="leading-relaxed">
                    This isn't a blog. It's not a journal. It's somewhere in between—a space for thoughts that don't fit neatly into categories or conversations.
                  </p>
                  <p className="leading-relaxed">
                    Here, thoughts exist without expectation. They're not written for engagement, SEO, or social validation. They're written because they needed to exist somewhere.
                  </p>
                  <p className="leading-relaxed">
                    You won't find comments sections here. Some thoughts are meant to be read, not responded to. Some ideas need to sit with you quietly.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Tags
                  </h3>
                  {tags && tags.length > 0 ? (
                    <TagCloud tags={tags} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags yet.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border-0 bg-card text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-serif font-semibold">
                        {stats?.totalThoughts ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Thoughts
                      </p>
                    </Card>
                    <Card className="p-4 border-0 bg-card text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Tags className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-serif font-semibold">
                        {stats?.totalTags ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Tags
                      </p>
                    </Card>
                    <Card className="p-4 border-0 bg-card text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Type className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-serif font-semibold">
                        {stats?.totalWords?.toLocaleString() ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Words
                      </p>
                    </Card>
                    <Card className="p-4 border-0 bg-card text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-serif font-semibold">
                        {stats?.totalViews?.toLocaleString() ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Views
                      </p>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
