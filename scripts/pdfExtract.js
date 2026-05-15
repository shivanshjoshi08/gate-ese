const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const { createCanvas } = require("canvas");

const MIN_TEXT_LENGTH = 80;
const OCR_SCALE = 2;

class NapiCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

const canvasFactory = new NapiCanvasFactory();

function toPdfJsUrl(dir) {
  const normalized = path.join(dir).replace(/\\/g, "/");
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function getPdfJsAssetPaths() {
  const root = path.join(__dirname, "..", "node_modules", "pdfjs-dist");
  return {
    cMapUrl: toPdfJsUrl(path.join(root, "cmaps")),
    standardFontDataUrl: toPdfJsUrl(path.join(root, "standard_fonts")),
  };
}

function toUint8Array(buffer) {
  if (buffer instanceof Uint8Array && !Buffer.isBuffer(buffer)) {
    return buffer;
  }
  return new Uint8Array(buffer);
}

async function loadPdfDocument(buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const assets = getPdfJsAssetPaths();
  return pdfjs.getDocument({
    data: toUint8Array(buffer),
    cMapUrl: assets.cMapUrl,
    cMapPacked: true,
    standardFontDataUrl: assets.standardFontDataUrl,
    useSystemFonts: true,
  }).promise;
}

async function extractWithPdfParse(buffer) {
  const data = await pdf(buffer, { max: 0 });
  return (data.text || "").trim();
}

async function extractWithPdfJs(buffer) {
  const doc = await loadPdfDocument(buffer);
  const parts = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    parts.push(content.items.map((it) => it.str).join(" "));
  }
  await doc.destroy();
  return parts.join("\n").trim();
}

async function renderPageToPng(doc, pageNum) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: OCR_SCALE });
  const w = Math.ceil(viewport.width);
  const h = Math.ceil(viewport.height);
  const { canvas, context } = canvasFactory.create(w, h);
  await page.render({
    canvasContext: context,
    viewport,
    canvasFactory,
  }).promise;
  return canvas.toBuffer("image/png");
}

async function extractWithOcr(filePath, onProgress) {
  const { createWorker } = require("tesseract.js");
  const buffer = fs.readFileSync(filePath);
  const doc = await loadPdfDocument(buffer);
  const worker = await createWorker("eng");
  const parts = [];
  const total = doc.numPages;

  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress(`OCR page ${i}/${total}`);
    const png = await renderPageToPng(doc, i);
    const {
      data: { text },
    } = await worker.recognize(png);
    parts.push(text || "");
  }

  await worker.terminate();
  await doc.destroy();
  return parts.join("\n\n").trim();
}

/**
 * @param {string} filePath
 * @param {(msg: string) => void} [onProgress]
 */
async function extractTextFromPdf(filePath, onProgress) {
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);

  if (onProgress) onProgress(`Extracting text: ${filename}`);
  let text = await extractWithPdfParse(buffer);
  if (text.length >= MIN_TEXT_LENGTH) {
    return { text, method: "pdf-parse" };
  }

  if (onProgress) onProgress(`Trying pdfjs text layer: ${filename}`);
  try {
    text = await extractWithPdfJs(buffer);
    if (text.length >= MIN_TEXT_LENGTH) {
      return { text, method: "pdfjs" };
    }
  } catch (err) {
    console.warn(`  pdfjs text failed: ${err.message}`);
  }

  if (process.env.OCR_ENABLED === "false") {
    throw new Error(
      `Insufficient text in ${filename} (scanned PDF). Set OCR_ENABLED=true or use text-based PDFs.`
    );
  }

  if (onProgress) onProgress(`OCR (scanned PDF): ${filename}`);
  text = await extractWithOcr(filePath, onProgress);
  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error(`OCR produced insufficient text from ${filename}`);
  }
  return { text, method: "ocr" };
}

module.exports = {
  extractTextFromPdf,
  MIN_TEXT_LENGTH,
};
