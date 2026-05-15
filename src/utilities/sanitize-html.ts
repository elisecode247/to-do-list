import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["a", "b", "br", "code", "em", "i", "li", "ol", "p", "pre", "strong", "u", "ul"];
const ALLOWED_ATTR = ["href", "title", "target", "rel"];

export function sanitizeUserHtml(rawHtml: string): string {
    return DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ["script", "style"],
        FORBID_ATTR: ["style"],
    });
}
