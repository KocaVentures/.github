const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function renderSVG(svgPath, outputPath) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Extract viewBox dimensions
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  let width = 800, height = 400;
  if (viewBoxMatch) {
    const [, , , w, h] = viewBoxMatch[1].split(/\s+/).map(Number);
    width = w || 800;
    height = h || 400;
  }
  
  await page.setViewport({ width: Math.ceil(width * 2), height: Math.ceil(height * 2) });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#0a0e14;">${svgContent}</body></html>`);
  await new Promise(r => setTimeout(r, 500)); // Let animations start
  await page.screenshot({ path: outputPath, fullPage: false });
  await browser.close();
  console.log(`Rendered: ${outputPath}`);
}

const assetsDir = './assets';
const outputDir = './rendered';

fs.readdirSync(assetsDir).filter(f => f.endsWith('.svg')).forEach(async (svg) => {
  await renderSVG(path.join(assetsDir, svg), path.join(outputDir, svg.replace('.svg', '.png')));
});
