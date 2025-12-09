const fs = require('fs');
const path = require('path');

// Recursively find all JS files
function findJSFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findJSFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
          fileList.push(filePath);
        }
      } catch (err) {
        // Skip files that can't be accessed
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  return fileList;
}

// Find all compiled JS files - try multiple possible dist locations
const possibleDistPaths = [
  path.join(__dirname, '../dist'),
  path.join(__dirname, '../dist/backend/src'),
  path.join(__dirname, '../dist/src'),
];

let distPath = null;
for (const possiblePath of possibleDistPaths) {
  if (fs.existsSync(possiblePath)) {
    distPath = possiblePath;
    break;
  }
}

if (!distPath) {
  console.error('Could not find dist directory. Tried:', possibleDistPaths);
  process.exit(1);
}

console.log(`Using dist path: ${distPath}`);
const files = findJSFiles(distPath);
console.log(`Found ${files.length} JS files to process`);

// Replace relative path imports with package name
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Replace relative paths to shared-types with package name
  content = content.replace(
    /require\(["']\.\.\/\.\.\/\.\.\/shared-types\/src["']\)/g,
    "require('@ocha-pos/shared-types')"
  );
  content = content.replace(
    /require\(["']\.\.\/\.\.\/shared-types\/src["']\)/g,
    "require('@ocha-pos/shared-types')"
  );
  content = content.replace(
    /require\(["']\.\.\/shared-types\/src["']\)/g,
    "require('@ocha-pos/shared-types')"
  );
  content = content.replace(
    /require\(["']\.\.\/\.\.\/\.\.\/shared-types\/dist["']\)/g,
    "require('@ocha-pos/shared-types')"
  );
  content = content.replace(
    /require\(["']\.\.\/\.\.\/shared-types\/dist["']\)/g,
    "require('@ocha-pos/shared-types')"
  );
  content = content.replace(
    /require\(["']\.\.\/shared-types\/dist["']\)/g,
    "require('@ocha-pos/shared-types')"
  );
  
  if (content !== originalContent) {
    try {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed imports in: ${path.relative(distPath, file)}`);
    } catch (err) {
      console.error(`Error writing file ${file}:`, err.message);
    }
  }
});

console.log(`✅ Fixed shared-types imports in ${files.length} files`);

