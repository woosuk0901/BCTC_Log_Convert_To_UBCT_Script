var process = require('process');
var fs = require('fs');
var readline = require('readline');
var construct_transaction = require('./construct_transaction');

var cmdHeader = "";
var cmdData = "";
var statusWord = "";


if (process.argv[2] != null) {
    var filePath = process.argv[2];
    console.log('\x1b[33m%s\x1b[0m', "file name : " + filePath);

    var rd = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        console: false,
        terminal : false
    });
    
    rd.on('line', function(line) {
        if ((line.indexOf('APDU') != -1) || (line.indexOf('Select') != -1) || (line.indexOf('GPO') != -1) || (line.indexOf('READ RECORD') != -1) || (line.indexOf('GAC') != -1) || (line.indexOf('Verfiy Pin') != -1)) {
            var headerIdx = line.indexOf('<black>') + 7;
            var dataIdx = line.indexOf('<black>', headerIdx) + 7;
            cmdHeader = line.substr(headerIdx, 14);
            cmdHeader = cmdHeader.split(' ').join('');
            var dataLength = cmdHeader.substr(cmdHeader.length - 2);
            if (dataLength != '00') {
                cmdData = line.substr(dataIdx, 3 * parseInt(dataLength, 16) - 1);
                cmdData = cmdData.split(' ').join('');
            }
            // construct_transaction.set_cmd(cmdHeader + cmdData);
        }
        if (line.indexOf('SW1_SW2') != -1) {
            var responseData = "";
            var statusWord = "";
            var swIdx = line.indexOf('SW1_SW2') + 17;
            statusWord = line.substr(swIdx, 4);

            // check Response Data
            if (line.indexOf('OutCard') != -1) {
                var responseIdx = line.indexOf('OutCard') + 17;
                responseData = line.substr(responseIdx, swIdx - responseIdx - 25);
                responseData = responseData.split(' ').join('');
            }
            construct_transaction.set_cmd(cmdHeader, cmdData, statusWord);
            cmdHeader = "";
            cmdData = "";
            statusWord = "";
           //  construct_transaction.set_response(statusWord);
        }
    });

    rd.on('close', () => {
        console.log('ERROR_SCRIPT:');
    })
}