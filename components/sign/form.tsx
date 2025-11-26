"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiGithub, SiGmail, SiGoogle } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app";

export default function SignForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations();
  const router = useRouter();
  const { setUser } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const isSignUp = mode === "signup";

  // Check if Google/GitHub auth is enabled
  // Force enable Google if env var is missing/false as per request, or follow env
  const googleEnabled = true; // process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
  const githubEnabled = process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true";

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: window.location.origin,
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to start Google sign in");
    }
  };

  const handleGithubSignIn = () => {
    signIn("github", {
      callbackUrl: window.location.origin,
    });
  };

  const refreshUserInfo = async () => {
    try {
      const resp = await fetch("/api/get-user-info", {
        method: "POST",
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch user info");
      }
      const { code, data, message } = await resp.json();
      if (code !== 0) {
        throw new Error(message);
      }
      setUser(data);
    } catch (error) {
      console.error("post-login fetch user error", error);
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

        toast.success("Signup successful! Please check your email to verify your account.");
        await refreshUserInfo();
        setMode("signin");
        setEmail("");
        setPassword("");
      } else {
        const result = await signIn("supabase-email", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error || "Signin failed");
        } else {
          toast.success("Signin successful!");
          await refreshUserInfo();
          router.refresh();
          router.push("/");
        }
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      toast.error(error.message || (isSignUp ? "Signup failed" : "Signin failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isSignUp ? t("sign_modal.sign_up_title") : t("sign_modal.sign_in_title")}
          </CardTitle>
          <CardDescription>
            {isSignUp ? t("sign_modal.sign_up_description") : t("sign_modal.sign_in_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <form onSubmit={handleEmailSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("sign_modal.email_title")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("sign_modal.email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("sign_modal.password_title")}</Label>
                  {!isSignUp && (
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      {t("sign_modal.forgot_password")}
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("sign_modal.password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <SiGmail className="w-4 h-4 mr-2" />
                {isLoading
                  ? t("sign_modal.loading") || "Loading..."
                  : isSignUp
                    ? t("sign_modal.sign_up_with_email") || "Sign Up"
                    : t("sign_modal.sign_in_with_email") || "Sign In"}
              </Button>
            </form>

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                {t("sign_modal.or")}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {googleEnabled && (
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <SiGoogle className="w-4 h-4 mr-2" />
                  {isSignUp ? t("sign_modal.google_sign_up") : t("sign_modal.google_sign_in")}
                </Button>
              )}
              {githubEnabled && (
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleGithubSignIn}
                  disabled={isLoading}
                >
                  <SiGithub className="w-4 h-4 mr-2" />
                  {isSignUp ? t("sign_modal.github_sign_up") : t("sign_modal.github_sign_in")}
                </Button>
              )}
            </div>

            <div className="text-center text-sm">
              {isSignUp ? (
                <>
                  {t("sign_modal.have_account")}{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode("signin");
                    }}
                  >
                    {t("sign_modal.sign_in_title")}
                  </a>
                </>
              ) : (
                <>
                  {t("sign_modal.no_account")}{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode("signup");
                    }}
                  >
                    {t("sign_modal.sign_up_title")}
                  </a>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="/terms-of-service" target="_blank">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy-policy" target="_blank">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
