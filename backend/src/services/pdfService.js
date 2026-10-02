const path = require("path");
const { pathToFileURL } = require("url");
const ApiError = require("../utils/ApiError");

const PDFJS_DIR = path.dirname(require.resolve("pdfjs-dist/package.json"));

let pdfjsPromise;
function loadPdfjs() {
  if (!pdfjsPromise) {
    const entry = pathToFileURL(
      path.join(PDFJS_DIR, "legacy", "build", "pdf.mjs")
    ).href;
    pdfjsPromise = import(entry);
  }
  return pdfjsPromise;
}

async function extractText(buffer) {
  const { getDocument, VerbosityLevel } = await loadPdfjs();
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
    verbosity: VerbosityLevel.ERRORS,
  });

  try {
    const doc = await loadingTask.promise;
    try {
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }
      text = text.trim();

      if (!text || text.length < 50) {
        throw ApiError.badRequest(
          "Could not extract readable text - is this a scanned/image-only PDF?"
        );
      }

      return { text, meta: { numPages: doc.numPages } };
    } finally {
      await doc.cleanup();
    }
  } catch (err) {
    if (err.isOperational) throw err;
    throw ApiError.badRequest("Failed to parse PDF: " + err.message);
  } finally {
    await loadingTask.destroy();
  }
}

module.exports = { extractText };
