const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  if (!html) return res.status(400).send('HTML content missing');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
    displayHeaderFooter: true,
    footerTemplate: `<div style="font-size:10px; width:100%; text-align:center;"><span class="pageNumber"></span></div>`,
    headerTemplate: `<div></div>`,
    printBackground: true
  });

  await browser.close();
  res.set({ 'Content-Type': 'application/pdf' });
  res.send(pdf);
});

app.listen(port, () => {
  console.log(`PDF server is running on http://localhost:${port}`);
});
