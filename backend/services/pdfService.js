const { PDFParse } = require("pdf-parse");

function toBuffer(value) {
  if (!value) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value.buffer) {
    return Buffer.from(value.buffer);
  }

  if (value.$binary && value.$binary.base64) {
    return Buffer.from(value.$binary.base64, "base64");
  }

  return Buffer.from(value);
}

async function extractPdfText(value) {
  const buffer = toBuffer(value);

  if (!buffer || buffer.length === 0) {
    throw new Error("PDF file is empty or unavailable");
  }

  const parser = new PDFParse({
    data: buffer
  });

  try {
    const pdfData = await parser.getText();
    return pdfData.text || "";
  } finally {
    await parser.destroy();
  }
}

module.exports = {
  toBuffer,
  extractPdfText
};
