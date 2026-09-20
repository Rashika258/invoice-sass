"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/actions/auth-recovery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() { const params = useSearchParams(); const token = params.get("token") || ""; const [error, setError] = useState<string | null>(null); async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const result = await resetPassword(new FormData(event.currentTarget)); if (result.error) setError(result.error); } return <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4"><Card className="w-full max-w-md"><CardHeader><CardTitle>Set a new password</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4">{error && <p className="text-sm text-destructive">{error}</p>}<input type="hidden" name="token" value={token} /><div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" minLength={8} required /></div><Button className="w-full" disabled={!token}>Update password</Button></form></CardContent></Card></div>; }
