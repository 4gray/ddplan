'use strict';

const {app, Menu, Tray, BrowserWindow, ipcMain, shell} = require('electron')
const menubar = require('menubar');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let tray = null
// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform != 'darwin') {
		app.quit();
	}
});


/*
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
	//Create the browser window.
	mainWindow = new BrowserWindow({
		width: 280,
		height: 500,
		resizable: false,
		titleBarStyle: 'hidden',
		frame:false,
		frame: false,
		transparent:true
	});

	//and load the index.html of the app.
	mainWindow.loadURL('file://' + __dirname + '/index.html');

	//Open the DevTools.
	mainWindow.webContents.openDevTools();

	//Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
});

*/


var mb = menubar({
	tooltip: 'DDPlan',
	title: 'DDPlan',
	dir: __dirname,
	icon: __dirname + '/IconTemplate.png',
	width: 280,
	height: 500,
	resizable: false,
	preloadWindow: true,
	frame: false,
	transparent:true
});

mb.on('ready', function ready () {

	//mb.window.openDevTools()

	// const contextMenu = Menu.buildFromTemplate([
	// 	{label: 'Item1', type: 'radio'},
	// 	{label: 'Item2', type: 'radio'},
	// 	{label: 'Item3', type: 'radio', checked: true},
	// 	{label: 'Item4', type: 'radio'}
	// ]);

	// mb.tray.setContextMenu(contextMenu);
	// mb.tray.on('click', () => {
	// 	mb.showWindow();
	// });
});

ipcMain.on('quit', function (event, arg) {
	app.quit();
});

// ipcMain.on('openUrl', function (event, arg) {
// 	shell.openExternal(arg)
// });

/*
var AutoLaunch = require('auto-launch');

var appLauncher = new AutoLaunch({
    name: 'My NW.js or Electron app'
});

appLauncher.isEnabled().then(function(enabled){
    if(enabled) return;
    return appLauncher.enable()
}).then(function(err){

});

appLauncher.enable();
*/