"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: "Heslá sa nezhodujú",
      });
      return;
    }

    if (password.length < 4) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: "Heslo musí mať aspoň 4 znaky",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register(username, password);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Chyba registrácie",
        description: error instanceof Error ? error.message : "Registrácia zlyhala",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vytvorenie nového účtu</CardTitle>
        <CardDescription>Zadajte údaje pre registráciu</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <Label htmlFor="username">Používateľské meno</Label>
            <Input
              id="username"
              name="username"
              type="text"
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              placeholder="Zadajte heslo"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Potvrdenie hesla</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              placeholder="Zopakujte heslo"
            />
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrácia..." : "Registrovať sa"}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm">
            Už máte účet?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/90">
              Prihlásiť sa
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
