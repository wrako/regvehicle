"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your credentials to access the EMS registry system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required defaultValue="your.email@ems.sk" />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox id="remember-me" name="remember-me" />
                <Label htmlFor="remember-me" className="ml-2 block text-sm">
                  Remember me for 30 days
                </Label>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <Link href="/register" className="font-medium text-primary hover:text-primary/90">
                Register here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert className="mt-6">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          This system is for authorized EMS personnel only. Access is restricted to Slovakia and requires multi-factor authentication.
        </AlertDescription>
      </Alert>
      
      <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-bold">Demo Credentials</p>
        <p>Email: admin@ems.sk</p>
        <p>Password: admin123</p>
        <p>MFA Code: 123456</p>
      </div>

    </>
  );
}
