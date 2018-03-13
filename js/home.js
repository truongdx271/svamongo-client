const {
    exec
} = require('child_process');

const {
    ipcRenderer
} = require('electron');
const database = require('../js/database');
const moment = require('moment');
const axios = require('axios');
const remote = require('electron').remote;

const commandlineCSharp = `cd svacore && SVACLI.exe -u `;
const commandlineJava = `cd svacore && java -jar JavaBaseLineWebApp.jar -u `

window.onload = function () {
    document.getElementById('runBtn').addEventListener('click', (e) => {
        e.preventDefault();
        scanExecution();
    })
    document.getElementById('folderBtn').addEventListener('click', (e) => {
        e.preventDefault();
        ipcRenderer.send('open-folder');
    })
    refreshProjects();
    // setTimeout(database.getProjects((projs) => {
    //     initProjects(projs);
    // }), 2000);
    // setTimeout(location.reload());
}

//
function testGlobal() {
    // remote.getGlobal('sharedObj').token = 420;
    // ipcRenderer.send('show-globalvar');

    //test momentjs
    // var currentDate = new Date();
    // var epochDate = moment(currentDate).unix();
    // console.log(currentDate);
    // console.log(epochDate);

    //test table
    // var x = document.getElementById('result-section');
    // x.style.display = x.style.display == 'block' ? 'none' : 'block';

    //test radio
    // var cs = document.getElementById('csradio');
    // var jv = document.getElementById('javaradio');

    // console.log(cs.checked);
    // console.log(jv.checked);

    // if(cs.checked){
    //     console.log(cs.value);
    // }
    // if(jv.checked){
    //     console.log(jv.value);
    // }

    //test folder value
    // var foldervalue = document.getElementById('folder');
    // console.log(foldervalue.value);
    // console.log(foldervalue.value.replace('C', ''));
    // if(foldervalue.value == ''){
    //     console.log('null');
    // }

    // fetchResult();
    var tokenGlobal = remote.getGlobal('sharedObj').token;
    axios.get('https://10.60.156.82/api/projObjects', {
        headers: {
            Authorization: tokenGlobal
        }
    }).then((res) => {
        console.log(res);
    })
}


//Scan command here

function scanExecution() {
    var x = document.getElementById('result-section');
    x.style.display = 'none';
    var lsec = document.getElementById('load-section');
    lsec.style.display = lsec.style.display == 'block' ? 'none' : 'block';
    var condition = true;
    //CHECK PROJECT HERE
    var e = document.getElementById('slProject');
    if (e.selectedIndex > 0) {
        condition &= true;
    } else {
        condition &= false;
        console.log(`not chose project`);
    }
    //CHECK FOLDER HERE
    var Path = document.getElementById('folder');
    if (Path.value == '') {
        condition &= false;
        console.log(`not chose folder`)
    } else {
        condition &= true;
    }
    //CHECK RADIO HERE
    var cs = document.getElementById('csradio');
    var jv = document.getElementById('javaradio');
    var radioChecked = cs.checked | jv.checked;

    if (!radioChecked) {
        console.log(`not choose scan type`)
    }
    condition &= radioChecked;
    console.log(`condition: ${condition}`);

    if (condition) {
        var finalCommand;
        if (cs.checked) {
            finalCommand = commandlineCSharp + Path.value;
        } else {
            finalCommand = commandlineJava + Path.value;
        }
        console.log(finalCommand);
        exec(finalCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            lsec.style.display = 'none';
            console.log(JSON.parse(stdout));
            var data = JSON.parse(stdout);
            // console.log(`Project-code: ${e.options[e.selectedIndex].value}`)
            var tokenGlobal = remote.getGlobal('sharedObj').token;
            //old
            database.getProjectByCode(e.options[e.selectedIndex].value, (proj) => {
                console.log('co project roi');
                data.No = proj.scans;
                data.scantime = moment(data.scantime).format('MMMM Do YYYY, h:mm:ss a');

                console.log(proj.projectId);

                axios.post('https://10.60.156.82/api/projObjects/addScan', {
                    scan: {
                        id: proj.projectId,
                        scan: data
                    }
                }, {
                    headers: {
                        Authorization: tokenGlobal
                    }
                }).then(function (response) {
                    console.log(res);
                }).catch(function (error) {
                    console.log(error);
                })
            })
            drawDataTable(JSON.parse(stdout));
        })
    } else {

    }


}

function drawDataTable(data) {
    var folderPath = document.getElementById('folder');
    var x = document.getElementById('result-section');
    x.style.display = x.style.display == 'block' ? 'none' : 'block';
    document.getElementById('timelb').innerHTML = `Time: ${moment(data.scantime).format('MMMM Do YYYY, h:mm:ss a')}`;
    document.getElementById('totallb').innerHTML = `Total: ${data.total}`;
    console.log(`Scantime: ${data.scantime}`);
    console.log(`Total: ${data.total}`);
    // console.log(data);
    var tableBody = '';
    for (i = 0; i < data.resultItems.length; i++) {
        tableBody += '<tr>';
        tableBody += '  <td>' + data.resultItems[i].identify + '</td>';
        tableBody += '  <td>' + data.resultItems[i].displayTxt + '</td>';
        tableBody += '  <td>' + (data.resultItems[i].pathFile).replace(folderPath.value + '\\', '') + '</td>';
        tableBody += '  <td>' + data.resultItems[i].lineNumber + '</td>';
        tableBody += '  <td>' + data.resultItems[i].result + '</td>';
        tableBody += '</tr>';
    }

    // Fill the table content
    document.getElementById('tablebody').innerHTML = tableBody;
}

//refresh token


//refresh data for dropdown list
function refreshProjects() {
    console.log('refreshing....');
    database.getProjects((projs) => {
        if (projs.length > 0) {
            console.log(projs);
            initProjects(projs);
        } else {
            // window.location.reload();
        }
    })
}

//Init data for project dropdown list 
function initProjects(data) {
    let dropdown = document.getElementById('slProject');
    dropdown.length = 0;
    let defaultOption = document.createElement('option');
    defaultOption.text = 'Choose project!!!';

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    let option;
    for (let i = 0; i < data.length; i++) {
        // console.log(data[i]);
        // console.log(typeof data[i].projectName);
        if (data[i].projectName !== undefined) {
            option = document.createElement('option');
            option.text = `${data[i].projectName}`;
            option.value = data[i].projectCode;
            dropdown.add(option);
        }
        // console.log(`${data[i].projectName}+${data[i].projectCode}`);
    }
}

function fetchResult() {
    var e = document.getElementById('slProject');
    projectCode = e.options[e.selectedIndex].value;
    console.log(projectCode);
    var url = "https://10.60.156.82/api/projObjects"

    database.getTokens((tokens) => {
        // console.log(tokens);
        console.log(tokens[0].token);
        axios.get(url, {
            headers: {
                Authorization: tokens[0].token
            },
            params: {
                'filter[where][projectCode]': projectCode
            }
        }).then((res) => {
            console.log(res);
        }).catch((error) => {
            if (error.response.status == 401) {
                console.log('delete token...')
                console.log(tokens[0]._id);
                // database.deleteToken(fnc._id,(row)=>{
                //     ipcRenderer.send('token-timeout');
                // });
            }
        })
    })
}

ipcRenderer.on('folder-selected', (event, arg) => {
    console.log(`ipcrender: ${arg}`);
    var folderPath = document.getElementById('folder');
    folderPath.value = arg;
})

ipcRenderer.on('fetch-projectInfo', (event, arg) => {
    initProjects(arg);
})

ipcRenderer.on('updated-data', (event, arg) => {
    console.log('home page listend update')
    database.getProjects((projs) => {
        initProjects(projs);
    })
})

ipcRenderer.on('init-data-dropdown', (event, arg) => {
    database.getProjects((projs) => {
        initProjects(projs);
    })
})