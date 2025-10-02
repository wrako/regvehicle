"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProvider, updateProvider } from "@/lib/api";
import type { ProviderDto } from "@/types";

const providerSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
});

type ProviderFormData = z.infer<typeof providerSchema>;

export default function EditProviderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = typeof params?.id === "string" ? parseInt(params.id) : 0;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      providerId: "",
      name: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (!id) return;

    const loadProvider = async () => {
      try {
        setLoading(true);
        const provider: ProviderDto = await getProvider(id);
        form.reset({
          providerId: provider.providerId,
          name: provider.name,
          email: provider.email || "",
          address: provider.address,
        });
      } catch (error: any) {
        console.error("Load provider error:", error);
        if (error.message.includes("404")) {
          toast({
            title: "Provider not found",
            description: "The provider you're looking for doesn't exist.",
            variant: "destructive",
          });
          router.push("/dashboard/providers");
        } else {
          toast({
            title: "Error loading provider",
            description: error?.message || "Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProvider();
  }, [id, form, toast, router]);

  const onSubmit = async (data: ProviderFormData) => {
    try {
      setSubmitting(true);
      await updateProvider(id, data);
      toast({
        title: "Provider updated successfully",
        description: "The provider has been updated.",
      });
      router.push("/dashboard/providers");
    } catch (error: any) {
      console.error("Update provider error:", error);
      toast({
        title: "Error updating provider",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/providers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Edit Provider</h1>
      </div>

      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-md">
          <Building className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Edit Provider</h2>
          <p className="text-muted-foreground">Update provider information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Details</CardTitle>
          <CardDescription>Update the provider information below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter provider ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter provider name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter provider address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Updating..." : "Update Provider"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/providers">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}