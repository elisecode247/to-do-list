import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const templatePath = resolve(root, "dist/index.html");
const rendererPath = resolve(root, ".prerender/prerender-entry.js");
const template = await readFile(templatePath, "utf8");
const { render } = await import(pathToFileURL(rendererPath).href);

const routes = [
    {
        path: "/",
        output: "dist/index.html",
        title: "Daily Reset List",
        description: "A calm daily task list for recurring responsibilities and one-time reminders—without streaks, scores, or overdue guilt.",
        social: true,
    },
    {
        path: "/privacy-policy",
        output: "dist/privacy-policy/index.html",
        title: "Privacy Policy | Daily Reset List",
        description: "Learn how Daily Reset List collects, uses, stores, and protects account, task, journal, and Google Calendar data.",
    },
    {
        path: "/templates",
        output: "dist/templates/index.html",
        title: "Task Templates | Daily Reset List",
        description: "Browse gentle, practical task templates for home, self-care, pets, work, people, and leisure.",
    },
];

for (const route of routes) {
    const appHtml = render(route.path);
    const canonicalUrl = `https://dailyresetlist.com${route.path}`;
    const outputPath = resolve(root, route.output);
    const socialTags = route.social
        ? [
            `    <meta property="og:type" content="website">`,
            `    <meta property="og:site_name" content="Daily Reset List">`,
            `    <meta property="og:title" content="${route.title}">`,
            `    <meta property="og:description" content="${route.description}">`,
            `    <meta property="og:url" content="${canonicalUrl}">`,
            `    <meta property="og:image" content="https://dailyresetlist.com/og.png">`,
            `    <meta property="og:image:width" content="1200">`,
            `    <meta property="og:image:height" content="630">`,
            `    <meta property="og:image:alt" content="Daily Reset List — A gentler way to remember what matters today.">`,
            `    <meta name="twitter:card" content="summary_large_image">`,
            `    <meta name="twitter:title" content="${route.title}">`,
            `    <meta name="twitter:description" content="${route.description}">`,
            `    <meta name="twitter:image" content="https://dailyresetlist.com/og.png">`,
            `    <script type="application/ld+json">${JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Daily Reset List",
                url: "https://dailyresetlist.com/",
                description: route.description,
                applicationCategory: "LifestyleApplication",
                operatingSystem: "Any",
                offers: {
                    "@type": "Offer",
                    price: 0,
                    priceCurrency: "USD",
                },
            })}</script>`,
        ].join("\n")
        : "";
    const html = template
        .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
        .replace(
            "</head>",
            `    <meta name="description" content="${route.description}">\n` +
            `    <link rel="canonical" href="${canonicalUrl}">\n` +
            (socialTags ? `${socialTags}\n` : "") +
            "</head>",
        )
        .replace('<div id="app-root"></div>', `<div id="app-root">${appHtml}</div>`);

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);
}
