"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SiGithub, SiGmail, SiGoogle } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";
import { useAppContext } from "@/contexts/app";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignModal() {
  const t = useTranslations();
  const { showSignModal, setShowSignModal, signModalMode, setSignModalMode } = useAppContext();

  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isSignUp = signModalMode === "signup";
  const title = isSignUp ? t("sign_modal.sign_up_title") : t("sign_modal.sign_in_title");
  const description = isSignUp ? t("sign_modal.sign_up_description") : t("sign_modal.sign_in_description");

  if (isDesktop) {
    return (
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <ProfileForm isSignUp={isSignUp} />
          <div className="text-center text-sm text-muted-foreground pt-2 border-t">
            {isSignUp ? (
              <>
                {t("sign_modal.have_account")}{" "}
                <button
                  onClick={() => setSignModalMode("signin")}
                  className="text-primary hover:underline font-medium"
                >
                  {t("sign_modal.sign_in_title")}
                </button>
              </>
            ) : (
              <>
                {t("sign_modal.no_account")}{" "}
                <button
                  onClick={() => setSignModalMode("signup")}
                  className="text-primary hover:underline font-medium"
                >
                  {t("sign_modal.sign_up_title")}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showSignModal} onOpenChange={setShowSignModal}>
      <DrawerContent className="bg-white dark:bg-gray-800">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" isSignUp={isSignUp} />
        <div className="px-4 text-center text-sm text-muted-foreground pt-2 border-t">
          {isSignUp ? (
            <>
              {t("sign_modal.have_account")}{" "}
              <button
                onClick={() => setSignModalMode("signin")}
                className="text-primary hover:underline font-medium"
              >
                {t("sign_modal.sign_in_title")}
              </button>
            </>
          ) : (
            <>
              {t("sign_modal.no_account")}{" "}
              <button
                onClick={() => setSignModalMode("signup")}
                className="text-primary hover:underline font-medium"
              >
                {t("sign_modal.sign_up_title")}
              </button>
            </>
          )}
        </div>
        <DrawerFooter className="pt-4">
          <DrawerClose asChild>
            <Button variant="outline">{t("sign_modal.cancel_title")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({
  className,
  isSignUp = false,
}: React.ComponentProps<"form"> & { isSignUp?: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const { setShowSignModal, setSignModalMode, setUser } = useAppContext();
  const { update: updateSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Check if Google/GitHub auth is enabled
  const googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
  const githubEnabled = process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true";

  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: window.location.href,
    });
  };

  const handleGithubSignIn = () => {
    signIn("github", {
      callbackUrl: window.location.href,
    });
  };

  const refreshUserInfo = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const resp = await fetch("/api/get-user-info", {
          method: "POST",
        });
        if (!resp.ok) {
          throw new Error("Failed to fetch user info");
        }
        const { code, data, message } = await resp.json();
        if (code !== 0) {
          // If no auth, wait a bit and retry
          if (code === -2 && i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }
          throw new Error(message);
        }
        setUser(data);
        return;
      } catch (error) {
        if (i === retries - 1) {
          console.error("Failed to refresh user info after retries", error);
        } else {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Network error" }));
          toast.error(errorData.message || "Signup failed");
          setIsLoading(false);
          return;
        }

        const result = await response.json();
        
        if (result.code !== 0) {
          toast.error(result.message || "Signup failed");
          setIsLoading(false);
          return;
        }

        toast.success(result.message || result.data?.message || "Signup successful! Please check your email to verify your account.");
        await refreshUserInfo();
        setShowSignModal(false);
        setSignModalMode("signin");
        setEmail("");
        setPassword("");
        setIsLoading(false);
      } else {
        // Sign in with NextAuth credentials provider (uses Supabase backend)
        const result = await signIn("supabase-email", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error || "Signin failed");
          setIsLoading(false);
          return;
        }

        // Update session to ensure it's refreshed on the server side
        await updateSession();
        
        toast.success("Signin successful!");
        
        // Refresh user info with retry logic to handle session propagation delay
        await refreshUserInfo();
        
        router.refresh();
        setShowSignModal(false);
        setEmail("");
        setPassword("");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      toast.error(error.message || (isSignUp ? "Signup failed" : "Signin failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("grid items-start gap-4", className)}>
      <form onSubmit={handleEmailSubmit} className="space-y-4 w-full">
        <div className="grid gap-2">
          <Label htmlFor="email">{t("sign_modal.email_title")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("sign_modal.email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{t("sign_modal.password_title")}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("sign_modal.password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            minLength={6}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full flex items-center gap-2"
          disabled={isLoading}
        >
          <SiGmail className="w-4 h-4" />
          {isLoading
            ? t("sign_modal.loading") || "Loading..."
            : isSignUp
              ? t("sign_modal.sign_up_with_email") || "Sign Up"
              : t("sign_modal.sign_in_with_email") || "Sign In"}
        </Button>
      </form>

      {/* Always show Google button as requested */}
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          {t("sign_modal.or")}
        </span>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full flex items-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <SiGoogle className="w-4 h-4" />
        {isSignUp ? t("sign_modal.google_sign_up") : t("sign_modal.google_sign_in")}
      </Button>

      {githubEnabled && (
        <Button
          variant="outline"
          type="button"
          className="w-full flex items-center gap-2"
          onClick={handleGithubSignIn}
          disabled={isLoading}
        >
          <SiGithub className="w-4 h-4" />
          {isSignUp ? t("sign_modal.github_sign_up") : t("sign_modal.github_sign_in")}
        </Button>
      )}
    </div>
  );
}
