import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThoughtCard, ThoughtCardSkeleton } from "@/components/thought-card";
import type { ThoughtWithAuthor, Tag } from "@shared/schema";

export default function Thoughts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: thoughts, isLoading: thoughtsLoading } = useQuery<ThoughtWithAuthor[]>({
    queryKey: ["/api/thoughts", { tag: selectedTag, search: searchQuery }],
  });

  const { data: tags } = useQuery<Array<Tag & { count: number }>>({
    queryKey: ["/api/tags"],
  });

  const filteredThoughts = thoughts?.filter((thought) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        thought.title.toLowerCase().includes(query) ||
        thought.excerpt?.toLowerCase().includes(query) ||
        thought.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
  };

  const hasFilters = searchQuery || selectedTag;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              All Thoughts
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Browse through all the thoughts that have found their way here. Each one exists for its own reasons.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search thoughts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            {hasFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            )}
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant={selectedTag === null ? "default" : "secondary"}
                className="cursor-pointer text-xs font-mono uppercase tracking-wide"
                onClick={() => setSelectedTag(null)}
                data-testid="tag-filter-all"
              >
                All
              </Badge>
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTag === tag.slug ? "default" : "secondary"}
                  className="cursor-pointer text-xs font-mono uppercase tracking-wide"
                  onClick={() => setSelectedTag(tag.slug)}
                  data-testid={`tag-filter-${tag.slug}`}
                >
                  {tag.name} ({tag.count})
                </Badge>
              ))}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {thoughtsLoading ? (
              <>
                <ThoughtCardSkeleton />
                <ThoughtCardSkeleton />
                <ThoughtCardSkeleton />
                <ThoughtCardSkeleton />
                <ThoughtCardSkeleton />
                <ThoughtCardSkeleton />
              </>
            ) : filteredThoughts && filteredThoughts.length > 0 ? (
              filteredThoughts.map((thought) => (
                <ThoughtCard key={thought.id} thought={thought} />
              ))
            ) : (
              <Card className="col-span-full p-12 text-center border-0 bg-card">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold mb-2">
                  No thoughts found
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  {hasFilters
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "This space is waiting for its first thought."}
                </p>
                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </Card>
            )}
          </div>

          {filteredThoughts && filteredThoughts.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground font-mono">
                Showing {filteredThoughts.length} thought{filteredThoughts.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
