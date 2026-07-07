const { app, BrowserWindow } = require('electron');
const path = require('path');

const PORT = 3000;

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 860,
    title: '내 할 일',
    autoHideMenuBar: true,
  });
  win.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(() => {
  process.env.TODO_DATA_FILE = path.join(app.getPath('userData'), 'todos.json');
  process.env.ICLOUD_CONFIG_FILE = path.join(app.getPath('userData'), '.env');

  const expressApp = require('./server');
  expressApp.listen(PORT, () => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
