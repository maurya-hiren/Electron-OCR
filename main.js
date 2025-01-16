const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
});

// Handle file dialog requests for PDF selection
ipcMain.handle('dialog:openFile', async (_, filters) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters,
  });
  return result.filePaths;
});

// Convert PDF to image and store inside /public/image/
ipcMain.handle('convertPdfToImage', async (_, filePath) => {
  const appDir = app.getAppPath();
  const outputDir = path.join(appDir, 'public', 'image');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Sanitize filename
  const baseName = path.basename(filePath, path.extname(filePath))
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_-]/g, ''); // Remove special characters

  const outputFile = path.join(outputDir, baseName);

  console.log(`Converting PDF to image: ${filePath}`);
  console.log(`Storing converted file in: ${outputFile}`);

  return new Promise((resolve, reject) => {
    const command = 'pdftoppm';
    const args = ['-png', filePath, outputFile];

    console.log(`Executing: ${command} ${args.join(' ')}`);

    execFile(command, args, (error, stdout, stderr) => {
      if (error) {
        console.error('Error during PDF conversion:', stderr);
        return reject(new Error(stderr || 'Failed to convert PDF'));
      }

      const convertedFile = `/public/image/${baseName}-1.png`; // Relative path
      console.log(`PDF converted successfully: ${convertedFile}`);

      // Show a success message
      dialog.showMessageBox({
        type: 'info',
        title: 'Conversion Successful',
        message: `PDF converted to image successfully!\nSaved as ${convertedFile}`,
        buttons: ['OK']
      });

      resolve(convertedFile);
    });
  });
});

// Open a new window to select and display the image
ipcMain.handle('openImageWindow', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Image Files', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'] }],
  });

  if (!result.filePaths.length) return;

  const imagePath = result.filePaths[0];

  const imageWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: "Image Viewer with OCR",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  imageWindow.loadURL(`file://${__dirname}/image_viewer.html?imagePath=${encodeURIComponent(imagePath)}`);

  imageWindow.webContents.openDevTools();
});
