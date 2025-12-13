import { Link } from "wouter";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { ThoughtWithAuthor, Tag } from "@shared/schema";

interface ThoughtCardProps {
  thought: ThoughtWithAuthor;
  variant?: "default" | "compact";
}

export function ThoughtCard({ thought, variant = "default" }: ThoughtCardProps) {
  const isCompact = variant === "compact";

  return (
    <Link href={`/thoughts/${thought.slug}`} data-testid={`card-thought-${thought.id}`}>
      <Card className="group p-6 md:p-8 border-0 bg-card hover-elevate active-elevate-2 transition-all duration-200 cursor-pointer">
        <article className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
            <time dateTime={new Date(thought.createdAt).toISOString()}>
              {formatDate(thought.createdAt)}
            </time>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {thought.readingTime} min read
            </span>
          </div>

          <h3 className={`font-serif font-semibold leading-tight ${
            isCompact ? "text-xl" : "text-2xl md:text-3xl"
          }`}>
            {thought.title}
          </h3>

          {!isCompact && thought.excerpt && (
            <p className="text-muted-foreground leading-relaxed line-clamp-3">
              {thought.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {thought.tags.slice(0, 4).map((tag: Tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs font-mono uppercase tracking-wide"
              >
                {tag.name}
              </Badge>
            ))}
            {thought.tags.length > 4 && (
              <Badge variant="outline" className="text-xs font-mono">
                +{thought.tags.length - 4}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors pt-2">
            <span>Read thought</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </article>
      </Card>
    </Link>
  );
}

export function ThoughtCardSkeleton({ variant = "default" }: { variant?: "default" | "compact" }) {
  const isCompact = variant === "compact";

  return (
    <Card className="p-6 md:p-8 border-0 bg-card">
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className={`bg-muted rounded ${isCompact ? "h-6 w-3/4" : "h-8 w-full"}`} />
        {!isCompact && (
          <>
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </>
        )}
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-20 bg-muted rounded-full" />
          <div className="h-6 w-14 bg-muted rounded-full" />
        </div>
      </div>
    </Card>
  );
}
