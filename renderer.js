const convertBtn = document.getElementById('convert-btn');
const openImageBtn = document.getElementById('open-image-btn');

convertBtn.addEventListener('click', async () => {
  console.log('Convert button clicked');

  const filters = [{ name: 'PDF Files', extensions: ['pdf'] }];
  const filePaths = await window.electronAPI.openFileDialog(filters);

  if (!filePaths || filePaths.length === 0) {
    console.log('No PDF selected');
    return;
  }

  const filePath = filePaths[0];
  console.log(`Selected PDF: ${filePath}`);

  try {
    await window.electronAPI.convertPdf(filePath);
    console.log('PDF successfully converted.');
  } catch (error) {
    console.error('Error converting PDF:', error);
  }
});

openImageBtn.addEventListener('click', () => {
  console.log('Open Image button clicked');
  window.electronAPI.openImageWindow();
});
