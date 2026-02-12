import { createFileRoute } from "@tanstack/react-router";
import { ComponentExample } from "@/components/component-example.tsx";

export const Route = createFileRoute("/")({ component: App });

function App() {
return (
  <ComponentExample />
);
}