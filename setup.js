const { execSync } = require('child_process');
const path = require('path');

const run = (cmd, cwd) => {
  console.log(`\n> ${cmd} (en ${path.relative(process.cwd(), cwd) || '.'})\n`);
  execSync(cmd, { cwd, stdio: 'inherit' });
};

console.log('=== FutNova Setup ===\n');

run('npm install', path.join(__dirname, 'frontend'));

console.log('\n=== Setup completo! ===');
console.log('Ahora podes levantar el frontend con: npm run dev\n');
