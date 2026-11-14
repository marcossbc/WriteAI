import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create account — WriteAI" };
export default function Page() {
  return <div className="theme-purple"><Suspense><AuthForm mode="signup" /></Suspense></div>;
}
