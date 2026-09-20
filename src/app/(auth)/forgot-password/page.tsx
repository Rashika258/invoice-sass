"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth-recovery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(null); const result = await requestPasswordReset(new FormData(event.currentTarget)); if (result.error) setError(result.error); else setSent(true); }
  return <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4"><Card className="w-full max-w-md"><CardHeader><CardTitle>Forgot password?</CardTitle></CardHeader><CardContent>{sent ? <p className="text-sm text-muted-foreground">If an account exists for that email, reset instructions have been sent.</p> : <form onSubmit={submit} className="space-y-4">{error && <p className="text-sm text-destructive">{error}</p>}<div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div><Button className="w-full">Send reset link</Button></form>}<Link href="/login" className="mt-5 block text-center text-sm text-primary hover:underline">Back to sign in</Link></CardContent></Card></div>;
}
