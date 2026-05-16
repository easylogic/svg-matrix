import { viteBundler } from "@vuepress/bundler-vite";
import { defaultTheme } from "@vuepress/theme-default";
import { createReadStream, existsSync, statSync } from "node:fs";
import { cp, readdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineUserConfig } from "vuepress";
import { lessonsByPart } from "../../../lesson_runtime/lesson-data.js";

const configDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(configDir, "../..");
const packagesRoot = resolve(configDir, "../../..");
const dist = join(siteRoot, "dist");

function sidebar() {
  return lessonsByPart().map((group) => ({
    text: group.part,
    collapsible: false,
    children: group.lessons.map((lesson) => `/guide/lesson-${lesson.id}.md`)
  }));
}

function contentType(path) {
  const types = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8"
  };
  return types[extname(path)] ?? "application/octet-stream";
}

function lessonAssetsVitePlugin() {
  return {
    name: "svg-matrix-course-lesson-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const first = url.pathname.split("/").filter(Boolean)[0];
        const isLesson = /^lesson_\d{3}$/.test(first ?? "");
        const isSharedPackage = ["lesson_runtime", "svg-matrix-core"].includes(first ?? "");
        if (!isLesson && !isSharedPackage) {
          next();
          return;
        }

        const rest = url.pathname.split("/").filter(Boolean).slice(1);
        let file = join(packagesRoot, first, ...rest);
        if (!existsSync(file)) {
          next();
          return;
        }

        if (statSync(file).isDirectory()) file = join(file, "index.html");
        if (!existsSync(file)) {
          next();
          return;
        }

        res.setHeader("content-type", contentType(file));
        createReadStream(file).pipe(res);
      });
    }
  };
}

async function copyLessonAssets() {
  const entries = await readdir(packagesRoot);
  const staticPackages = ["lesson_runtime", "svg-matrix-core"];
  await Promise.all(staticPackages.map((entry) => cp(join(packagesRoot, entry), join(dist, entry), { recursive: true })));
  await Promise.all(
    entries
      .filter((entry) => /^lesson_\d{3}$/.test(entry))
      .map((entry) => cp(join(packagesRoot, entry), join(dist, entry), { recursive: true }))
  );
}

export default defineUserConfig({
  lang: "ko-KR",
  title: "SVG Graphics Geometry",
  description: "SVG path, stroke, fill, and coordinate math for vector editors.",
  dest: dist,
  bundler: viteBundler({
    viteOptions: {
      plugins: [lessonAssetsVitePlugin()]
    }
  }),
  theme: defaultTheme({
    navbar: [
      { text: "Guide", link: "/guide/" },
      { text: "css-matrix", link: "https://github.com/easylogic/css-graphics-geometry" }
    ],
    sidebar: {
      "/guide/": sidebar()
    }
  }),
  clientConfigFile: resolve(configDir, "client.js"),
  onGenerated: async () => {
    await copyLessonAssets();
  }
});
