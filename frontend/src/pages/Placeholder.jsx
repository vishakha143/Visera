import { Construction } from "lucide-react";

export function Placeholder({ title }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Construction size={22} />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        This page is coming soon. We will build it step by step.
      </p>
    </div>
  );
}