import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(root, 'src', 'template.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'src', 'game.js'), 'utf8');

if (!tpl.includes('<!--GAME_JS-->')) {
  console.error('template.html 缺少 <!--GAME_JS--> 占位符');
  process.exit(1);
}
const out = tpl.replace('<!--GAME_JS-->', '<script>\n' + js + '\n</script>');
fs.writeFileSync(path.join(root, 'index.html'), out, 'utf8');
console.log(`已生成 index.html (${Math.round(out.length / 1024)} KB)`);
