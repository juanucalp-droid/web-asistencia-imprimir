const fs = require('node:fs/promises');
const path = require('node:path');
const express = require('express');
const { PDFDocument } = require('pdf-lib');

const app = express();
const port = Number(process.env.PORT) || 3000;
const listsPath = path.join(__dirname, 'lists.json');
const maxPdfBytes = 25 * 1024 * 1024;
const downloadTimeoutMs = 20_000;

app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(__dirname, 'public')));

async function readLists() {
  const content = await fs.readFile(listsPath, 'utf8');
  const lists = JSON.parse(content);

  if (!Array.isArray(lists)) {
    throw new Error('lists.json debe contener una lista de objetos.');
  }

  return lists;
}

function validateList(list) {
  if (!list || typeof list.name !== 'string' || typeof list.filename !== 'string' || typeof list.url !== 'string') {
    throw new Error('Cada lista debe tener name, filename y url.');
  }

  const parsedUrl = new URL(list.url);
  if (parsedUrl.protocol !== 'https:') {
    throw new Error(`La URL de ${list.filename} debe utilizar HTTPS.`);
  }
}

async function downloadPdf(url, filename) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), downloadTimeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
      throw new Error('el servidor remoto redirigio la URL');
    }
    if (!response.ok) {
      throw new Error(`el servidor remoto respondio HTTP ${response.status}`);
    }

    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > maxPdfBytes) {
      throw new Error('el archivo supera el limite de 25 MB');
    }
    if (!response.body) {
      throw new Error('la respuesta no contiene datos');
    }

    const reader = response.body.getReader();
    const chunks = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxPdfBytes) {
        await reader.cancel();
        throw new Error('el archivo supera el limite de 25 MB');
      }
      chunks.push(Buffer.from(value));
    }

    const buffer = Buffer.concat(chunks);
    if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new Error('el recurso descargado no es un PDF valido');
    }
    return buffer;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('se agoto el tiempo de espera de 20 segundos');
    }
    throw new Error(`${filename}: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

app.get('/api/lists', async (_request, response) => {
  try {
    const lists = await readLists();
    lists.forEach(validateList);
    response.json(lists);
  } catch (error) {
    response.status(500).json({ error: `No se pudo cargar lists.json: ${error.message}` });
  }
});

app.post('/api/combine', async (request, response) => {
  try {
    const lists = await readLists();
    lists.forEach(validateList);
    const selectedUrls = request.body?.urls;

    if (!Array.isArray(selectedUrls) || selectedUrls.length === 0) {
      return response.status(400).json({ error: 'Seleccione al menos una lista.' });
    }
    if (selectedUrls.length > lists.length) {
      return response.status(400).json({ error: 'La seleccion contiene listas no disponibles.' });
    }

    const selectedLists = selectedUrls.map((url) => lists.find((list) => list.url === url));
    if (selectedLists.some((list) => !list)) {
      return response.status(400).json({ error: 'Una o mas URLs no pertenecen a lists.json.' });
    }

    const mergedPdf = await PDFDocument.create();
    for (const list of selectedLists) {
      const pdfBytes = await downloadPdf(list.url, list.filename);
      let sourcePdf;
      try {
        sourcePdf = await PDFDocument.load(pdfBytes);
      } catch {
        throw new Error(`${list.filename}: el archivo no pudo ser interpretado como PDF`);
      }
      const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const combinedPdf = await mergedPdf.save();
    response.type('application/pdf').set({
      'Content-Disposition': 'inline; filename="listas_para_imprimir.pdf"',
      'Cache-Control': 'no-store'
    }).send(Buffer.from(combinedPdf));
  } catch (error) {
    response.status(502).json({ error: `No se pudo generar el PDF: ${error.message}` });
  }
});

app.use((_request, response) => {
  response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Impresion de listas disponible en http://localhost:${port}`);
});