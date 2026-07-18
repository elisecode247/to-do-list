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
        description: "A gentle daily task list for remembering what matters without goals, streaks, or emotional penalty.",
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
    const html = template
        .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
        .replace(
            "</head>",
            `    <meta name="description" content="${route.description}">\n` +
            `    <link rel="canonical" href="${canonicalUrl}">\n` +
            "</head>",
        )
        .replace('<div id="app-root"></div>', `<div id="app-root">${appHtml}</div>`);

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);
}
