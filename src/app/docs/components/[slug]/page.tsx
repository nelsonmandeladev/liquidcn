import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { componentBySlug, components } from "@/examples";
import { ComponentPage } from "@/www/docs/component-page";

// One page per documented registry item, all prerendered; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return components.map((component) => ({ slug: component.slug }));
}

export async function generateMetadata(props: PageProps<"/docs/components/[slug]">) {
  const { slug } = await props.params;
  const component = componentBySlug(slug);
  if (!component) return {};
  return {
    title: component.name,
    description: component.registry.description,
    alternates: { canonical: `/docs/components/${slug}` },
  } satisfies Metadata;
}

export default async function Page(props: PageProps<"/docs/components/[slug]">) {
  const { slug } = await props.params;
  const component = componentBySlug(slug);
  if (!component) notFound();
  return <ComponentPage component={component} />;
}
