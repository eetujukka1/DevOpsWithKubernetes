const http = require("http");

const port = Number(process.env.PORT) || 3000;
const targetUrl = process.argv[2] || process.env.URL;

if (!targetUrl) {
  console.error("Usage: node index.js <url>");
  console.error("Example: node index.js https://example.com");
  process.exit(1);
}

async function downloadHtml(url) {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("URL must use http or https");
  }

  const response = await fetch(parsedUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download ${parsedUrl.href}: ${response.status} ${response.statusText}`,
    );
  }

  return {
    baseUrl: response.url,
    html: await response.text(),
  };
}

async function main() {
  const page = await downloadHtml(targetUrl);
  const html = withBaseHref(page.html, page.baseUrl);

  const server = http.createServer((req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(html);
  });

  server.listen(port, () => {
    console.log(`Serving ${targetUrl} on port ${port}`);
  });
}

function withBaseHref(html, baseUrl) {
  const base = `<base href="${escapeHtmlAttribute(baseUrl)}">`;

  if (/<base\s/i.test(html)) {
    return html;
  }

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
  }

  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${base}</head>`);
  }

  return `<head>${base}</head>${html}`;
}

function escapeHtmlAttribute(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
