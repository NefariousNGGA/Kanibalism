import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-6">
            <CardContent>
              <p>Please log in to view your profile.</p>
              <Link to="/login">
                <Button className="mt-4">Log In</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserProfile({ displayName, bio, avatarUrl });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
      setIsEditing(false); // Exit edit mode on success
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Could not update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    // Revert changes to original values
    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setAvatarUrl(user.avatarUrl || "");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <Card className="border-0 bg-card">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.displayName || user.username}'s avatar`}
                    className="h-24 w-24 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border border-border">
                    <span className="text-2xl font-medium">
                      {(user.displayName || user.username)?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl font-serif">
                {isEditing ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-2xl font-serif text-center border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    placeholder="Display Name"
                  />
                ) : (
                  user.displayName || user.username
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">@{user.username}</p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Bio
                  </h3>
                  {isEditing ? (
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-foreground">
                      {bio || "No bio provided."}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Avatar URL
                  </h3>
                  {isEditing ? (
                    <Input
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Current Avatar Preview"
                          className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No avatar set</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit} disabled={isUpdating}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleUpdateProfile} variant="outline" className="mx-auto">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}