const fs = require('fs');
const path = require('path');

// Recursively find all JS files
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Find all compiled JS files
const distPath = path.join(__dirname, '../dist');
const files = findJSFiles(distPath);

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
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed imports in: ${path.relative(distPath, file)}`);
  }
});

console.log('Fixed shared-types imports');

