import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { ArrowLeft, Save, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { slugify, calculateReadingTime, countWords } from "@/lib/utils";
import { insertThoughtSchema } from "@shared/schema";
import { z } from "zod";
import type { ThoughtWithAuthor, Tag } from "@shared/schema";

const editorSchema = insertThoughtSchema.extend({
  title: insertThoughtSchema.shape.title.min(1, "Title is required"),
  content: insertThoughtSchema.shape.content.min(1, "Content is required"),
  tags: z.string().optional(),
});

type EditorFormData = z.infer<typeof editorSchema>;

export default function Editor() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute("/edit/:id");
  const thoughtId = params?.id;
  const isEditing = !!thoughtId;

  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: thought, isLoading: thoughtLoading } = useQuery<ThoughtWithAuthor>({
    queryKey: ["/api/thoughts/by-id", thoughtId],
    enabled: isEditing,
  });

  const { data: existingTags } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const form = useForm<EditorFormData>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      title: "",
      content: "",
      slug: "",
      excerpt: "",
      isPublished: true,
      readingTime: 1,
      wordCount: 0,
    },
  });

  const content = form.watch("content");
  const title = form.watch("title");

  useEffect(() => {
    if (content) {
      const words = countWords(content);
      const readTime = calculateReadingTime(content);
      form.setValue("wordCount", words);
      form.setValue("readingTime", readTime);
    }
  }, [content, form]);

  useEffect(() => {
    if (title && !isEditing) {
      form.setValue("slug", slugify(title));
    }
  }, [title, form, isEditing]);

  useEffect(() => {
    if (thought && isEditing) {
      form.reset({
        title: thought.title,
        content: thought.content,
        slug: thought.slug,
        excerpt: thought.excerpt || "",
        isPublished: thought.isPublished,
        readingTime: thought.readingTime,
        wordCount: thought.wordCount,
      });
      setSelectedTags(thought.tags.map((t) => t.name));
    }
  }, [thought, isEditing, form]);

  const createMutation = useMutation({
    mutationFn: async (data: EditorFormData & { tagNames: string[] }) => {
      const response = await apiRequest("POST", "/api/thoughts", data);
      return response as ThoughtWithAuthor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/thoughts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Thought published",
        description: "Your thought has been shared with the world.",
      });
      setLocation(`/thoughts/${data.slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish thought.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditorFormData & { tagNames: string[] }) => {
      const response = await apiRequest("PATCH", `/api/thoughts/${thoughtId}`, data);
      return response as ThoughtWithAuthor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/thoughts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Thought updated",
        description: "Your changes have been saved.",
      });
      setLocation(`/thoughts/${data.slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update thought.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditorFormData) => {
    const payload = {
      ...data,
      tagNames: selectedTags,
    };
    
    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (isEditing && thoughtLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <span>{form.watch("wordCount")} words</span>
              <span className="text-border">|</span>
              <span>{form.watch("readingTime")} min read</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-8 py-12">
        <h1 className="font-serif text-3xl font-semibold mb-8">
          {isEditing ? "Edit Thought" : "New Thought"}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What's on your mind?"
                      className="text-xl font-serif"
                      data-testid="input-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">URL Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="url-friendly-slug"
                      className="font-mono text-sm"
                      data-testid="input-slug"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be part of the URL: /thoughts/{field.value || "your-slug"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Let your thoughts flow..."
                      className="min-h-[400px] font-serif text-lg leading-relaxed resize-y"
                      data-testid="input-content"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Excerpt (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief preview of your thought..."
                      className="min-h-[100px] resize-y"
                      data-testid="input-excerpt"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This appears in thought cards and previews. Leave blank to auto-generate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel className="text-base">Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm font-mono gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`button-remove-tag-${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                data-testid="input-tags"
              />
              {existingTags && existingTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs text-muted-foreground mr-2">Suggestions:</span>
                  {existingTags
                    .filter((t) => !selectedTags.includes(t.name))
                    .slice(0, 8)
                    .map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs font-mono cursor-pointer"
                        onClick={() => addTag(tag.name)}
                        data-testid={`button-suggest-tag-${tag.slug}`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            <Card className="p-6 border-0 bg-card">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <FormLabel className="text-base flex items-center gap-2">
                        {field.value ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        {field.value ? "Published" : "Draft"}
                      </FormLabel>
                      <FormDescription>
                        {field.value
                          ? "This thought will be visible to everyone."
                          : "This thought will be saved as a draft."}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-published"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Card>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                data-testid="button-save"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Thought" : "Publish Thought"}
                  </>
                )}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
