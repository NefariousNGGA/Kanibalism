import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Plus, 
  FileText, 
  Tags, 
  Type, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StatsCard, StatsCardSkeleton } from "@/components/stats-card";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ThoughtWithAuthor, Stats } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: thoughts, isLoading: thoughtsLoading } = useQuery<ThoughtWithAuthor[]>({
    queryKey: ["/api/thoughts/my"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats/my"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/thoughts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thoughts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Thought deleted",
        description: "Your thought has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete thought. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user.displayName || user.username}.
              </p>
            </div>
            <Link href="/new">
              <Button data-testid="button-new-thought">
                <Plus className="mr-2 h-4 w-4" />
                New Thought
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {statsLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <StatsCard
                  title="Thoughts"
                  value={stats?.totalThoughts ?? 0}
                  icon={FileText}
                />
                <StatsCard
                  title="Tags Used"
                  value={stats?.totalTags ?? 0}
                  icon={Tags}
                />
                <StatsCard
                  title="Total Words"
                  value={stats?.totalWords ?? 0}
                  icon={Type}
                />
                <StatsCard
                  title="Total Views"
                  value={stats?.totalViews ?? 0}
                  icon={Eye}
                />
              </>
            )}
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold mb-6">
              Your Thoughts
            </h2>

            {thoughtsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 border-0 bg-card animate-pulse">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="h-6 w-3/4 bg-muted rounded" />
                        <div className="h-4 w-1/2 bg-muted rounded" />
                      </div>
                      <div className="h-8 w-8 bg-muted rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : thoughts && thoughts.length > 0 ? (
              <div className="space-y-4">
                {thoughts.map((thought) => (
                  <Card key={thought.id} className="p-6 border-0 bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {!thought.isPublished && (
                            <Badge variant="outline" className="text-xs">
                              Draft
                            </Badge>
                          )}
                          <h3 className="font-serif text-lg font-semibold truncate">
                            {thought.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(thought.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {thought.viewCount} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Type className="h-3.5 w-3.5" />
                            {thought.wordCount} words
                          </span>
                        </div>
                        {thought.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {thought.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag.id}
                                variant="secondary"
                                className="text-xs font-mono"
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {thought.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{thought.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-menu-${thought.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/thoughts/${thought.slug}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/edit/${thought.id}`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete thought?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete 
                                  "{thought.title}" from your thoughts.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(thought.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-0 bg-card">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold mb-2">
                  No thoughts yet
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  Your thoughts will appear here once you start writing. Every thought begins with a single word.
                </p>
                <Link href="/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Write your first thought
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
