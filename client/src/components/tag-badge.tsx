import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import type { Tag } from "@shared/schema";

interface TagBadgeProps {
  tag: Tag;
  count?: number;
  interactive?: boolean;
}

export function TagBadge({ tag, count, interactive = true }: TagBadgeProps) {
  const content = (
    <Badge
      variant="secondary"
      className="text-xs font-mono uppercase tracking-wide px-3 py-1"
    >
      {tag.name}
      {count !== undefined && (
        <span className="ml-1.5 text-muted-foreground">({count})</span>
      )}
    </Badge>
  );

  if (!interactive) return content;

  return (
    <Link
      href={`/tags/${tag.slug}`}
      data-testid={`tag-${tag.slug}`}
    >
      {content}
    </Link>
  );
}

interface TagCloudProps {
  tags: Array<Tag & { count?: number }>;
  interactive?: boolean;
}

export function TagCloud({ tags, interactive = true }: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No tags yet.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          count={tag.count}
          interactive={interactive}
        />
      ))}
    </div>
  );
}
