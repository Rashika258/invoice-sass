"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { loginUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

function LoginForm() {
  const searchParams = useSearchParams();
  const paramError = searchParams.get("error");
  const [error, setError] = useState<string | null>(paramError);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginUser(new FormData(event.currentTarget));
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err: any) {
      if (err?.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
      setError(err?.message || "An unexpected error occurred during sign in.");
      setIsLoading(false);
    }
  }

  return (
    <CardContent className="space-y-4">
      <GoogleSignInButton text="Sign in with Google" />

      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative px-2 bg-card text-xs uppercase text-muted-foreground font-medium">
          Or continue with email
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </CardContent>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/40">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background font-black text-lg shadow-xs">
            B
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground">Billora</span>
            <span className="text-[10px] text-muted-foreground block -mt-1 font-medium">Business Suite</span>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your business
            </p>
          </CardHeader>
          <Suspense fallback={<CardContent><p className="text-center text-sm text-muted-foreground">Loading...</p></CardContent>}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
