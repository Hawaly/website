import { redirect } from "next/navigation";

export default function Home() {
  // Rediriger vers le dashboard par défaut
  redirect("/dashboard");
}
