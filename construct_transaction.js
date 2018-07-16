var cmd;
var expected_sw;

var AID;
var pdol_data;
var cdol_data;
var UDK;
var ENC;


module.exports = {
    set_cmd : (command, data, sw) => {
        var ins = command.substr(2, 2);
    
        switch(ins)
        {
            case 'A4' : {
                console.log('// SELECT');
                AID = data;
                console.log('SET AID \"' + AID + '\"');
                cmd = 'GPSELECT USERCARD AID RESP SW \"' + sw + '\"';
            }break;
            case 'A8' : {
                console.log('// GPO');
                pdol_data = data;
                consol.log('SET PDOL_DATA \"' + pdol_data + '\"');
                console.log('APPEND CMD \"' + command + '\" PDOL_DATA');
                cmd = 'SENDAPDU USERCARD CMD RESP SW \"' + sw + '\"';
            }break;
            case 'AE' : {
                console.log('// Generate AC');
                cdol_data = data;
                consol.log('SET CDOL_DATA \"' + cdol_data + '\"');
                console.log('APPEND CMD \"' + command + '\" CDOL_DATA');
                cmd = 'SENDAPDU USERCARD CMD RESP SW \"' + sw + '\"';
            }break;
            case 'B2' : {
                console.log('// Read Record');
                console.log('SET CMD \"' + command + '\"');
                cmd = 'SENDAPDU USERCARD CMD RESP SW \"' + sw + '\"';
            }break;
            case 'CA' : {
                console.log('// Get Data');
                console.log('SET CMD \"' + command + '\"');
                cmd = 'SENDAPDU USERCARD CMD RESP SW \"' + sw + '\"';
            }break;
            case 'DA' : {
                console.log('// Put Data');
                console.log('SET CMD \"' + command + '\"');
                cmd = 'SENDAPDU USERCARD CMD RESP SW \"' + sw + '\"';
            }break;
            default : {
                console.log('// Command');
                console.log('SET CMD \"' + command + '\"');
                cmd = 'SENDAPDU USERCARD CMD RESP SW \"' + sw + '\"';
            }
    
        }
        console.log('JNE SW \"' + sw + '\" ERROR_SCRIPT');
        console.log(" ");
    },
    set_response : (sw) => {
        cmd = cmd + '\"' + sw + '\"';
        console.log(cmd);
        console.log('JNE SW \"' + sw + '\" ERROR_SCRIPT');
        console.log(" ");
    }    
};

