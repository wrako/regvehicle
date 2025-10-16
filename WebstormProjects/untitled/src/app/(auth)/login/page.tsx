"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(username, password);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Chyba prihlásenia",
        description: error instanceof Error ? error.message : "Neplatné prihlasovacie údaje",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Prihlásenie do systému</CardTitle>
          <CardDescription>Zadajte prihlasovacie údaje pre prístup do registra vozidiel ZZS</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <Label htmlFor="username">Používateľské meno</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                placeholder="Zadajte používateľské meno"
              />
            </div>

            <div>
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="Zadajte heslo"
              />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Prihlasovanie..." : "Prihlásiť sa"}
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
                  Nemáte účet?
                </span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <a href="/register" className="font-medium text-primary hover:text-primary/90">
                Registrovať sa
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert className="mt-6">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Bezpečnostné upozornenie</AlertTitle>
        <AlertDescription>
          Tento systém je určený len pre oprávnený personál ZZS. Prístup je zabezpečený autentifikáciou.
        </AlertDescription>
      </Alert>

      <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-bold">Demo prihlasovacie údaje</p>
        <p>Používateľské meno: admin</p>
        <p>Heslo: pass</p>
      </div>

    </>
  );
}
