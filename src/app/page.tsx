'use client';
import { redirect } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const status = useAuthStore((s) => (s.status));

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    redirect("/login");
  }

  redirect("/dashboard");
}