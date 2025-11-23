import puppeteer from "puppeteer";
import tutorRoutes from "./tutor_route.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const run = async () => {
  if (!Array.isArray(tutorRoutes) || tutorRoutes.length === 0) {
    console.error("No routes found in tutor_route.js");
    return;
  }

  // Ensure output directory exists (save next to this script)
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();

    // Optional: perform login if credentials are provided via env vars
    const email = process.env.SCREENSHOT_EMAIL;
    const password = process.env.SCREENSHOT_PASSWORD;
    if (email && password) {
      try {
        const loginUrl = `http://localhost:3000/login`;
        console.log(`Logging in at ${loginUrl} as ${email}`);
        await page.goto(loginUrl, { waitUntil: "networkidle2" });

        await page.type('input[name="email"]', email, { delay: 30 });
        await page.type('input[name="password"]', password, { delay: 30 });

        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }).catch(() => null),
        ]);

        console.log("Login attempt finished; continuing to screenshot routes.");
      } catch (err) {
        console.error("Login failed:", err);
      }
    } else {
      console.log("No login credentials provided via env vars; skipping login.");
    }

    for (let index = 0; index < tutorRoutes.length; index++) {
      const route = tutorRoutes[index];
      const pathPart = typeof route === "string" ? route.replace(/^\/+/, "") : String(route);
      const url = pathPart.startsWith("http://") || pathPart.startsWith("https://")
        ? pathPart
        : `http://localhost:3000/${pathPart}`;

      console.log(`Navigating to ${url}`);
      await page.goto(url, { waitUntil: "networkidle2" });

      // Give page a moment to render dynamic content
      await page.waitForTimeout(500);

      // Scroll the page slowly to trigger lazy-loading images / content
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          const total = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
          const viewport = window.innerHeight;
          let pos = 0;
          const step = Math.max(Math.floor(viewport * 0.9), 300);
          const iv = setInterval(() => {
            pos += step;
            window.scrollTo(0, Math.min(pos, total));
            if (pos >= total) {
              clearInterval(iv);
              // allow any lazy-loads to finish
              setTimeout(resolve, 300);
            }
          }, 150);
        });
        // scroll back to top so layout is stable for screenshots
        window.scrollTo(0, 0);
      });

      // Remove or neutralize fixed/sticky elements which may block full-page captures
      await page.evaluate(() => {
        const elems = [];
        const walk = (root) => {
          const tree = root.querySelectorAll('*');
          tree.forEach((el) => {
            try {
              const style = window.getComputedStyle(el);
              if (style.position === 'fixed' || style.position === 'sticky') elems.push(el);
            } catch (e) {}
          });
        };
        walk(document);
        elems.forEach((el) => {
          el.__savedPosition = el.style.position;
          el.__savedZ = el.style.zIndex;
          el.style.position = 'static';
          el.style.zIndex = 'auto';
        });
      });

      // Calculate the full height of the page
      const fullHeight = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
      const viewportWidth = 1280;
      const maxViewportHeight = 16000; // Chromium has a max viewport height

      const outPath = `${outDir}/fullpage_${index}.png`;

      if (fullHeight <= maxViewportHeight) {
        await page.setViewport({ width: viewportWidth, height: Math.max(800, Math.min(fullHeight, maxViewportHeight)) });
        await page.screenshot({ path: outPath, fullPage: false });
      } else {
        // If page is extremely tall, let Puppeteer stitch a fullPage screenshot
        await page.setViewport({ width: viewportWidth, height: 900 });
        await page.screenshot({ path: outPath, fullPage: true });
      }

      console.log(`Saved screenshot: ${outPath}`);

      // restore any modified fixed elements (best-effort)
      await page.evaluate(() => {
        const tree = document.querySelectorAll('*');
        tree.forEach((el) => {
          if (el.__savedPosition !== undefined) {
            el.style.position = el.__savedPosition;
            el.style.zIndex = el.__savedZ;
            delete el.__savedPosition;
            delete el.__savedZ;
          }
        });
      });
    }

    await page.close();
  } catch (err) {
    console.error("Screenshotting failed:", err);
  } finally {
    await browser.close();
  }
};

run();
