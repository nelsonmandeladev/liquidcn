import { components } from "@/examples";
import { llmsFullText } from "@/www/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullText(components), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
