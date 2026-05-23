import fs from 'fs';
import path from 'path';

const root = process.cwd();
const imagesDir = path.join(root, 'images');
const templateFile = path.join(root, 'index.template.html');
const outputFile = path.join(root, 'index.html');
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg']);

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fileUrl(name) {
  return `images/${encodeURIComponent(name).replace(/%2F/g, '/')}`;
}

if (!fs.existsSync(imagesDir)) {
  throw new Error('images/ directory does not exist.');
}

const files = fs.readdirSync(imagesDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => allowedExtensions.has(path.extname(name).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

if (!files.length) {
  throw new Error('No image files found in images/');
}

const galleryItems = files.map((name) => {
  const caption = path.basename(name, path.extname(name)).replace(/[_-]+/g, ' ').trim();
  const alt = caption || name;
  const url = fileUrl(name);
  return `            <a href="${url}" data-author="Local image">
                <img src="${url}" alt="${escapeHtml(alt)}">
                <div class="caption"><strong>${escapeHtml(caption)}</strong>Local photo</div>
            </a>`;
}).join('\n');

const template = fs.readFileSync(templateFile, 'utf8');
const markerStart = '<!-- GALLERY:START -->';
const markerEnd = '<!-- GALLERY:END -->';
const startIndex = template.indexOf(markerStart);
const endIndex = template.indexOf(markerEnd);

if (startIndex === -1 || endIndex === -1) {
  throw new Error(`Template markers not found in ${templateFile}. Add ${markerStart} and ${markerEnd}.`);
}

const output = `${template.slice(0, startIndex + markerStart.length)}\n${galleryItems}\n        ${template.slice(endIndex)}`;
fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Generated ${path.basename(outputFile)} with ${files.length} image(s).`);
