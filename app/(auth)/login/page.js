import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign in — WriteAI" };
export default function Page() {
  return <div className="theme-purple"><Suspense><AuthForm mode="login" /></Suspense></div>;
}
