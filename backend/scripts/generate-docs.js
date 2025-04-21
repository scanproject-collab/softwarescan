#!/usr/bin/env node

/**
 * Script to generate API documentation using Scalar
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the api-docs directory exists
const docsPath = path.join(__dirname, '..', 'api-docs');
if (!fs.existsSync(docsPath)) {
  fs.mkdirSync(docsPath, { recursive: true });
}

console.log('🚀 Generating API documentation...');

try {
  // Copy some basic files to the api-docs directory
  const scalarJsonPath = path.join(__dirname, '..', 'scalar.json');
  const scalarJson = JSON.parse(fs.readFileSync(scalarJsonPath, 'utf8'));

  // Create a basic HTML file with Redoc, which is more reliable
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plataforma Scan API Documentation</title>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Roboto, sans-serif;
    }
    #redoc-container {
      height: 100vh;
    }
    .header {
      background-color: #1E54B7;
      color: white;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 300;
    }
    .header .version {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Plataforma Scan API</h1>
    <span class="version">v${scalarJson.info.version}</span>
  </div>
  <div id="redoc-container"></div>

  <script src="https://unpkg.com/redoc@latest/bundles/redoc.standalone.js"></script>
  <script>
    Redoc.init(
      './openapi.json', 
      {
        scrollYOffset: 60,
        hideDownloadButton: false,
        theme: {
          colors: {
            primary: {
              main: '#1E54B7'
            }
          },
          typography: {
            fontFamily: 'Roboto, sans-serif',
            headings: {
              fontFamily: 'Montserrat, sans-serif'
            }
          }
        }
      },
      document.getElementById('redoc-container')
    );
  </script>
</body>
</html>
  `;

  fs.writeFileSync(path.join(docsPath, 'index.html'), htmlContent);
  fs.writeFileSync(path.join(docsPath, 'openapi.json'), JSON.stringify(scalarJson, null, 2));

  console.log('✅ Documentation generated successfully!');
  console.log(`📚 Documentation is available in the 'api-docs' directory`);
  console.log('💡 To view docs during development, visit: http://localhost:3000/api-docs');
} catch (error) {
  console.error('❌ Error generating documentation:', error.message);
  process.exit(1);
} 