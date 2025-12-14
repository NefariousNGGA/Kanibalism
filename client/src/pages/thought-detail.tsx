import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ThoughtDetail() {
  console.log("Simple ThoughtDetail loaded"); // Add this log
  const [, params] = useRoute("/thoughts/:slug");
  const slug = params?.slug;

  console.log("Slug from route:", slug); // Add this log

  const { data: thought, isLoading, error } = useQuery({
    queryKey: ["/api/thoughts", slug],
    enabled: !!slug,
  });

  console.log("Query result:", { isLoading, error, thought }); // Add this log

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !thought) {
    return (
      <div>
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-6 md:px-8">
            <h1>Error or Not Found</h1>
            <p>Details: {error ? error.message : "No thought data"}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If we get here, the API call was successful
  return (
    <div>
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-6">
            {thought.title}
          </h1>
          <p>Author: {thought.author?.displayName || thought.author?.username}</p>
          <div className="prose prose-lg dark:prose-invert max-w-none font-serif">
            <div className="leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {thought.content}
            </div>
          </div>
          <p>Reading Time: {thought.readingTime} min</p>
          <p>Views: {thought.viewCount}</p>
          {/* Add tags rendering if needed */}
          {thought.tags && thought.tags.length > 0 && (
            <div>
              Tags: {thought.tags.map(tag => tag.name).join(", ")}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}