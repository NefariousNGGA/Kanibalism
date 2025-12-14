import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import Home from "@/pages/home";
import Thoughts from "@/pages/thoughts";
import ThoughtDetail from "@/pages/thought-detail";
import About from "@/pages/about";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Editor from "@/pages/editor";
import TagsPage from "@/pages/tags";
import NotFound from "@/pages/not-found";
import Profile from "@/pages/profile"; // NEW: Import Profile page

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/thoughts" component={Thoughts} />
      <Route path="/thoughts/:slug" component={ThoughtDetail} />
      <Route path="/about" component={About} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/new" component={Editor} />
      <Route path="/edit/:id" component={Editor} />
      <Route path="/tags/:slug" component={TagsPage} />
      <Route path="/profile" component={Profile} /> {/* NEW: Add Profile route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;