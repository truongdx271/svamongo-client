const database = require('./js/database')
const electron = require('electron')
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  session,
  dialog,
} = electron
const path = require('path')
const url = require('url')
const axios = require('axios')
const qs = require('qs');
const moment = require('moment');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//global variable
global.sharedObj = {
  token: null
};

// Template for the Menu
menuTemplate = [{
    label: 'Application',
    submenu: [{
      label: 'About',
      click: () => {
        openAboutWindow()
      }
    }]
  },
  {
    label: 'View',
    submenu: [{
        role: 'reload',
        accelerator: 'CmdOrCtrl+R'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      },
    ]
  }

]

// Keep a global reference so the garbage collector does not destroy our app
let mainWindow, loginWindow

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    icon: __dirname + './assets/icon/icon.ico',
    width: 1280,
    height: 720
  })

  // Load the index.html file
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './views/home.html'),
    protocol: 'file:',
    slashes: true
  }))
  // mainWindow.webContents.openDevTools();

  // Set up the menu
  var menu = Menu.buildFromTemplate(menuTemplate)
  mainWindow.setMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  loginWindow = new BrowserWindow({
    parent: mainWindow,
    show: false,
    icon: __dirname + './assets/icon/icon.ico',
    width: 400,
    height: 400
  })
  loginWindow.loadURL(url.format({
    pathname: path.join(__dirname, './views/login.html'),
    protocol: 'file:',
    slashes: true
  }))
  loginWindow.setMenu(null)

  loginWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.show();
  mainWindow.webContents.send('init-data-dropdown');
  database.getTokens((tokens) => {
    if (tokens.length == 0) {
      loginWindow.show();
      mainWindow.hide();
    } else {
      global.sharedObj.token = tokens[0].token;
      for (let i = 0; i < tokens.length; i++) {
        var currentTime = new Date();
        var epochTime = moment(currentTime).unix();
        var token = tokens[i];
        if (token.ttl + token.currentTime < epochTime) {
          database.deleteToken(token._id, (numRow) => {
            loginWindow.show();
            mainWindow.hide();
            i = tokens.length;
          });
        }
      }
    }
  })

  // loginWindow.once('ready-to-show', () => {
  //   loginWindow.show()
  // })


}

// Opens the about window
function openAboutWindow() {

  let aboutWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    width: 400,
    height: 200
  })
  aboutWindow.loadURL(url.format({
    pathname: path.join(__dirname, './views/about.html'),
    protocol: 'file:',
    slashes: true
  }))
  aboutWindow.setMenu(null)
  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show()
  })
}

function selectDirectory() {
  // console.log(dialog.showOpenDialog(mainWindow, {
  //   properties: ['openDirectory']
  // }))
  var folder = dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  console.log(folder)
}

function getProjectData(token) {
  if (token) {
    let dataUrl = "https://10.60.156.82/api/projObjects";
    axios.get(dataUrl, {
      headers: {
        Authorization: token
      }
    }).then((res) => {
      // ipcMain.send('fetch-projectInfo',res);
      // let data = res;
      // ipcMain.on('load-data',(event,arg)=>{
      //   event.sender.send('fetch-projectInfo',data);
      // });
    })
  }
}


// Opens the login window
// function openLoginWindow() {

//   loginWindow = new BrowserWindow({
//     show: false,
//     width: 400,
//     height: 400
//   })
//   loginWindow.loadURL(url.format({
//     pathname: path.join(__dirname, './views/login.html'),
//     protocol: 'file:',
//     slashes: true
//   }))
//   loginWindow.setMenu(null)
//   loginWindow.once('ready-to-show', () => {
//     loginWindow.show()
//   })
// }

ipcMain.on('debug-logged', (event, arg) => {
  console.log(arg.token);
})

ipcMain.on('logged', (event, arg) => {
  console.log('losadasdasds');
  if (arg) {
    const cookie = {
      url: 'https://10.60.156.82',
      name: 'Token',
      value: arg.token,
      secure: true,
      httpOnly: true
    };
    console.log(cookie);
    session.defaultSession.cookies.set(cookie, (error) => {
      if (error) console.log(error)
    })
    session.defaultSession.cookies.get({
      name: 'Token'
    }, (error, cookies) => {
      console.log(cookies);
      let token = cookies[0].value;
      let dataUrl = "https://10.60.156.82/api/projObjects";
      axios.get(dataUrl, {
        headers: {
          Authorization: token
        },
        params: {
          'filter[where][projectOwner]': arg.userName
        }
      }).then((res) => {
        console.log('data received');
        console.log(res.data);
        // mainWindow.webContents.send('fetch-projectInfo', res.data)
        try {
          //OLD DATA

          // var counter = 0;
          // for (let i = 0; i < res.data.length; i++) {
          //   const element = res.data[i];
          //   database.getProjectByCode(element.projectCode, function (proj) {
          //     console.log(`Not null: ${element}`)
          //     if (proj === null) {
          //       console.log(`Null: ${element}`);
          //       // console.log(proj.projectCode);
          //       //insert here
          //       database.addProject(element, (row) => {
          //         counter += row;
          //         if (counter == res.data.length) {
          //           console.log("count to 10 success");
          //           mainWindow.webContents.send('updated-data');
          //         }
          //       });
          //       // console.log(`inserted`);
          //     } else {
          //       //update here
          //       database.updateProject(element, (row) => {
          //         counter += row;
          //         if (counter == res.data.length) {
          //           console.log("count to 10 success");
          //           mainWindow.webContents.send('updated-data');
          //         }
          //       });
          //       // console.log(`updated`);
          //     }
          //   })
          // }

          //NEW WAY
          // database.getProjects((docs)=>{
          //   console.log(docs);
          // })
          let counter = 0;
          database.deleteAllProject((row)=>{
            for (let i = 0; i < res.data.length; i++) {
              const element = res.data[i];
              database.addProject(element,(row)=>{
                counter+=row;
                if(counter == res.data.length){
                  mainWindow.webContents.send('updated-data');
                }
              })
            }
          })

        } catch (error) {
          console.log(err);
        }

        //Still con                                     flict....!!!
        // database.getProjects((projs) => {
        //   mainWindow.webContents.send('fetch-projectInfo', projs);
        // })
      })
      // getProjectData(cookies[0].value);
    })
    mainWindow.show();
    loginWindow.hide();
    // mainWindow.once('ready-to-show',()=>{
    //   mainWindow.show()
    // })
  }
})
ipcMain.on('open-folder', (event, arg) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  }, (selectedFolder) => {
    console.log(selectedFolder);
    console.log(typeof selectedFolder);
    event.sender.send('folder-selected', selectedFolder);
  })
})

ipcMain.on('show-globalvar', (event, data) => {
  console.log(global.sharedObj.token);
})

ipcMain.on('token-timeout',(event,arg)=>{
  mainWindow.hide();
  loginWindow.show();
})

// ipcMain.on('load-data',(event,data)=>{
//   session.defaultSession.cookies.get({
//     name: 'Token'
//   }, (error, cookies) => {
//     console.log(cookies[0].value);

//     // getProjectData(cookies[0].value);
//   })
// })
// Create the window then the app is ready
app.on('ready', () => {
  // openLoginWindow()
  createWindow()
  electron.powerMonitor.on('on-ac', () => {
    mainWindow.restore()
  })
  electron.powerMonitor.on('on-battery', () => {
    mainWindow.minimize()
  })
})



// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
})

// Reopen the app on macOS
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})