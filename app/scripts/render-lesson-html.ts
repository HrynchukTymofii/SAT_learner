/**
 * Utility to fetch and render TipTap lessons to complete HTML with CSS
 * This pre-renders lessons from your website so they can be stored in the database
 */

import axios from "axios";
import * as cheerio from "cheerio";

const API_BASE_URL = "https://www.satlearner.com";

interface LessonHtmlResult {
  html: string;
  css: string;
  combinedHtml: string;
}

/**
 * Fetches a lesson page from the website and extracts the rendered HTML + CSS
 */
export async function fetchRenderedLessonHtml(
  chapterId: string,
  lessonId: string
): Promise<LessonHtmlResult | null> {
  try {
    // Use the new export API endpoint that returns complete HTML
    const url = `${API_BASE_URL}/api/export/lesson/${chapterId}/${lessonId}`;
    console.log(`📄 Fetching rendered HTML for lesson ${lessonId}...`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SATLearner/1.0)",
      },
    });

    const completeHtml = response.data;
    //console.log(completeHtml)

    // The API returns a complete HTML document, so we can use it directly
    return {
      html: completeHtml, // Full HTML for display
      css: "", // CSS is already embedded in the HTML
      combinedHtml: completeHtml, // Same as html
    };
  } catch (error) {
    console.error(`❌ Failed to fetch lesson ${lessonId}:`, error);

    // Fallback to old method if the new API endpoint doesn't work
    try {
      console.log(`⚠️  Trying fallback method for lesson ${lessonId}...`);
      const url = `${API_BASE_URL}/expo-course/${chapterId}/lessons/${lessonId}`;

      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SATLearner/1.0)",
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract the lesson content
      const contentHtml = $(".expo-content").html() || $("body").html() || "";

      // Extract inline styles
      const inlineStyles: string[] = [];
      $("style").each((_, el) => {
        inlineStyles.push($(el).html() || "");
      });

      // Extract linked stylesheets content (if needed)
      const linkedStyles: string[] = [];
      $('link[rel="stylesheet"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          linkedStyles.push(`/* Stylesheet: ${href} */`);
        }
      });

      const combinedCss = [...inlineStyles, ...linkedStyles].join("\n\n");

      // Create a self-contained HTML document
      const combinedHtml = createSelfContainedHtml(contentHtml, combinedCss);

      return {
        html: contentHtml,
        css: combinedCss,
        combinedHtml,
      };
    } catch (fallbackError) {
      console.error(`❌ Fallback also failed for lesson ${lessonId}:`, fallbackError);
      return null;
    }
  }
}

/**
 * Creates a complete HTML document with embedded CSS and dark mode support
 */
function createSelfContainedHtml(content: string, css: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    /* Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Base styles */
    html, body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
    }

    body {
      padding: 0;
      margin: 0;
      background-color: transparent;
    }

    /* Light mode (default) */
    body {
      color: #1f2937;
      background-color: #ffffff;
    }

    /* Dark mode */
    body.dark-mode {
      color: #f5f5f4;
      background-color: #1e293b;
    }

    /* Content wrapper */
    .expo-content {
      padding: 0;
      width: 100%;
    }

    /* Typography */
    .expo-content h1 {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 16px;
      margin-top: 24px;
      color: inherit;
    }

    .expo-content h2 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      margin-top: 20px;
      color: inherit;
    }

    .expo-content h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
      margin-top: 16px;
      color: inherit;
    }

    .expo-content p {
      margin-bottom: 16px;
      font-size: 16px;
      line-height: 24px;
    }

    .expo-content ul, .expo-content ol {
      margin-left: 20px;
      margin-bottom: 16px;
    }

    .expo-content li {
      margin-bottom: 8px;
      line-height: 24px;
    }

    /* Code blocks */
    .expo-content code {
      font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
      font-size: 14px;
      padding: 2px 6px;
      border-radius: 4px;
      background-color: #f3f4f6;
    }

    body.dark-mode .expo-content code {
      background-color: #334155;
      color: #e2e8f0;
    }

    .expo-content pre {
      background-color: #f3f4f6;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin-bottom: 16px;
    }

    body.dark-mode .expo-content pre {
      background-color: #334155;
    }

    .expo-content pre code {
      background-color: transparent;
      padding: 0;
    }

    /* Blockquotes */
    .expo-content blockquote {
      border-left: 4px solid #06B6D4;
      padding-left: 16px;
      margin: 16px 0;
      background-color: #f0f9ff;
      padding: 12px 16px;
      border-radius: 8px;
    }

    body.dark-mode .expo-content blockquote {
      background-color: #334155;
      border-left-color: #06B6D4;
    }

    /* Links */
    .expo-content a {
      color: #06B6D4;
      text-decoration: none;
    }

    .expo-content a:hover {
      text-decoration: underline;
    }

    body.dark-mode .expo-content a {
      color: #22d3ee;
    }

    /* Images */
    .expo-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
    }

    /* Tables */
    .expo-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }

    .expo-content th,
    .expo-content td {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      text-align: left;
    }

    body.dark-mode .expo-content th,
    body.dark-mode .expo-content td {
      border-color: #334155;
    }

    .expo-content th {
      background-color: #f3f4f6;
      font-weight: 600;
    }

    body.dark-mode .expo-content th {
      background-color: #1e293b;
    }

    /* Math (KaTeX) */
    .katex {
      font-size: 1.1em;
    }

    body.dark-mode .katex {
      color: #f5f5f4;
    }

    /* Original CSS from the page */
    ${css}
  </style>

  <!-- KaTeX for LaTeX rendering (if needed) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
</head>
<body>
  <div class="expo-content">
    ${content}
  </div>

  <script>
    // Auto-render LaTeX when page loads
    document.addEventListener("DOMContentLoaded", function() {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\\\[", right: "\\\\]", display: true},
            {left: "\\\\(", right: "\\\\)", display: false}
          ],
          throwOnError: false
        });
      }
    });

    // Listen for theme changes from React Native
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'setTheme') {
          if (data.theme === 'dark') {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Batch process all lessons for a chapter
 */
export async function renderAllLessonsForChapter(
  chapterId: string,
  lessonIds: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  for (const lessonId of lessonIds) {
    const result = await fetchRenderedLessonHtml(chapterId, lessonId);
    if (result) {
      results.set(lessonId, result.combinedHtml);
      console.log(`✅ Rendered lesson ${lessonId}`);
    } else {
      console.warn(`⚠️ Failed to render lesson ${lessonId}`);
    }
  }

  return results;
}
