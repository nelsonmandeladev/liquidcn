import { components } from "@/examples";
import { llmsText } from "@/www/llms";
import { guides } from "@/www/nav";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsText(guides, components), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
