import { useEffect } from "react";

const SITE = "Grontho Bilash";

const setMeta = (selector: string, attr: "name" | "property", key: string, value: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = value;
};

// Sets the tab title and the description/share tags for the current page,
// and restores the previous values when the page unmounts.
export const usePageMeta = (title?: string, description?: string, image?: string) => {
  useEffect(() => {
    if (!title) return;
    const previousTitle = document.title;
    const previousDescription =
      document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? "";

    document.title = `${title} | ${SITE}`;
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
      setMeta('meta[property="og:description"]', "property", "og:description", description);
    }
    if (image) setMeta('meta[property="og:image"]', "property", "og:image", image);

    return () => {
      document.title = previousTitle;
      setMeta('meta[name="description"]', "name", "description", previousDescription);
    };
  }, [title, description, image]);
};
