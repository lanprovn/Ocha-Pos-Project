/**
 * Copy shared-types into frontend for Railway build
 * Used when Railway Root Directory is set to 'frontend'
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = __dirname.replace(/[\\/]scripts$/, '');
const ROOT_DIR = path.join(FRONTEND_DIR, '..');
const SHARED_TYPES_SRC = path.join(ROOT_DIR, 'shared-types');
const SHARED_TYPES_DEST = path.join(FRONTEND_DIR, 'shared-types');

console.log('🔧 Copying shared-types for Railway build...');
console.log('Frontend dir:', FRONTEND_DIR);
console.log('Root dir:', ROOT_DIR);
console.log('Shared-types src:', SHARED_TYPES_SRC);
console.log('Shared-types dest:', SHARED_TYPES_DEST);

// Check if shared-types exists at root level
if (!fs.existsSync(SHARED_TYPES_SRC)) {
  console.log('⚠️  shared-types not found at root, checking if already copied...');
  if (fs.existsSync(SHARED_TYPES_DEST)) {
    console.log('✅ shared-types already exists in frontend, skipping copy');
    process.exit(0);
  }
  console.error('❌ shared-types not found. Make sure it exists at:', SHARED_TYPES_SRC);
  process.exit(1);
}

// Copy shared-types to frontend
function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (fs.existsSync(SHARED_TYPES_DEST)) {
    console.log('🗑️  Removing existing shared-types in frontend...');
    fs.rmSync(SHARED_TYPES_DEST, { recursive: true, force: true });
  }
  
  console.log('📦 Copying shared-types...');
  copyRecursive(SHARED_TYPES_SRC, SHARED_TYPES_DEST);
  console.log('✅ Successfully copied shared-types to frontend');
  
  // Update package.json to use local shared-types
  const packageJsonPath = path.join(FRONTEND_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies['@ocha-pos/shared-types']) {
    packageJson.dependencies['@ocha-pos/shared-types'] = 'file:./shared-types';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ Updated package.json to use local shared-types');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error copying shared-types:', error.message);
  process.exit(1);
}

