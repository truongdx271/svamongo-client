const axios = require('axios');
const https = require('https');
const moment = require('moment');
const {
    session
} = require('electron');
// const remote = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

const database = require('../js/database')
// const cookies = {}
const remote = require('electron').remote;
const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectAnauthorized: false
    })
});

const agent = new https.Agent({
    rejectUnauthorized: false
});

window.onload = function () {
    document.getElementById('loginBtn').addEventListener('click', () => {
        var username = document.getElementById('username');
        var password = document.getElementById('password');
        console.log('wtf happened!!');
        login(username.value, password.value)
        username.value = '';
        password.value = '';
        //var token = login(username,password);
    })

    // document.addEventListener('keydown',(e)=>{
    //     e.preventDefault();
    //     if(e.which === 13){
    //         console.log('You pressed enter!');
    //     }
    // })

    // getDataSample();
}

// document.addEventListener('keydown', (e) => {
//     e.preventDefault();
//     if (e.which === 13) {
//         var loginbtn = document.getElementById('loginBtn');
//         loginbtn.click();
//     }
// })

// var loginBtn = document.getElementById('loginBtn');
// loginBtn.addEventListener('')

// document.getElementById('loginBtn').on('keypress', function(args) {
//     if (args.keyCode == 13) {
//         document.getElementById('loginBtn').click();
//     }
// });

function login(usrname, pword) {
    axios.post('https://10.60.156.82/api/accounts/login', {
        username: usrname,
        password: pword
    }).then(function (response) {
        // console.log(response.data.id);
        var current = new Date();
        var epochTime = moment(current).unix();
        const cookie = {
            token: response.data.id,
            ttl: response.data.ttl,
            userId: response.data.userId,
            userName: usrname,
            currentTime: epochTime
        }
        console.log(cookie);
        database.addToken(cookie, (newtoken) => {
            remote.getGlobal('sharedObj').token = newtoken.token;
            console.log(newtoken);
            ipcRenderer.send('logged', cookie);
        });
        // ipcRenderer.send('debug-logged', cookie);
    }).catch(function (error) {
        console.log(error);
    })
}