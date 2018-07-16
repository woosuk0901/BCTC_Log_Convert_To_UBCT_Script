
var cmd;
var expected_sw;

var AID;
var pdol_data;
var aip;
var afl;
var atc;
var cdol_data;
var UDK;
var ENC;

var transaction_num = 1;


module.exports = {
    init_Script : () => {
        
    },
    set_cmd : (command, data, sw) => {
        console.log("");
        var ins = command.substr(2, 2);
        switch(ins)
        {
            case 'A4' : {
                console.log('// SELECT');
                AID = data;
                // console.log('SET AID \"' + AID + '\"');
                console.log(`SET AID "${AID}"`);
                cmd = `GPSELECT USERCARD AID RESP SW "${sw}"`;
                console.log(cmd);
                console.log(`JNE SW "${sw}" ERROR_SCRIPT`);
                transaction_num++;
            }break;
            case 'A8' : {
                console.log('// GPO');
                pdol_data = data;
                console.log(`SET PDOL_DATA "${pdol_data}"`);
                console.log(`APPEND CMD "${command}" PDOL_DATA`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                console.log(cmd);
                console.log(`JNE SW "${sw}" ERROR_SCRIPT`);

                console.log('LFEF TEMP RESP 2');
                console.log(`JE TEMP "77" TRANSACTION${transaction_num++}_GPO_RESPONSE_TAG_77`);
                
                
            }break;
            case 'AE' : {
                console.log('// Generate AC');
                cdol_data = data;
                console.log(`SET CDOL_DATA "${cdol_data}"`);
                console.log(`APPEND CMD "${command}" CDOL_DATA`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                console.log(cmd);
                console.log(`JNE SW "${sw}" ERROR_SCRIPT`);
            }break;
            case 'B2' : {
                console.log('// Read Record');
                console.log(`SET CMD "${command}"`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                console.log(cmd);
                console.log(`JNE SW "${sw}" ERROR_SCRIPT`);
            }break;
            case 'CA' : {
                console.log('// Get Data');
                console.log(`SET CMD "${command}"`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                console.log(cmd);
                console.log(`JNE SW "${sw}" ERROR_SCRIPT`);
            }break;
            case 'DA' : {
                console.log('// Put Data');
                console.log(`SET CMD "${command}"`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                console.log(cmd);
                console.log(`JNE SW "${sw}" ERROR_SCRIPT`);
            }break;
            default : {
                console.log('// Command');
                console.log(`SET CMD "${command}"`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                console.log(cmd);
                console.log(`JNE SW "${sw}" ERROR_SCRIPT`);
            }
        }
    },
    end_script : () => {
        transaction_num = 1;
    }
};

