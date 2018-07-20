var fs = require('fs');

var string;
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

var transaction_num = 0;
var logger;
var flag_1st_gen_AC = false;

function print_Script(line) {
    logger.write(line + '\r\n');
}

module.exports = {
    setOutputFilePath : (path) => {
        logger = fs.createWriteStream(path, {
            // flags: 'a+' // 'a' means appending (old data will be preserved)
            flags: 'w'
          });
    },
    init_Script : () => {
        print_Script(`LOCAL STRING CMD`);
        print_Script(`LOCAL STRING RESP`);
        print_Script(`LOCAL STRING SW`);
        print_Script(`LOCAL STRING DATA`);
        print_Script(`LOCAL STRING TEMP`);
        print_Script(`LOCAL STRING AID`);
        print_Script(`LOCAL STRING AIP`);
        print_Script(`LOCAL STRING AFL`);
        print_Script(`LOCAL STRING CID`);
        print_Script(`LOCAL STRING ATC`);
        print_Script(`LOCAL STRING PDOL_DATA`);
        print_Script(`LOCAL STRING CDOL1_DATA`);
        print_Script(`LOCAL STRING CDOL2_DATA`);
        print_Script(`LOCAL STRING RESP_AC1`);
        print_Script(`LOCAL STRING RESP_AC2`);
        print_Script(`LOCAL STRING CAC`);
        print_Script(`LOCAL STRING IAD`);
        print_Script(`LOCAL STRING CVR`);
        print_Script(`LOCAL STRING AOSA`);
        print_Script(`LOCAL STRING SESK`);
        print_Script(`LOCAL STRING CALCULATED_AC`);
        print_Script(`LOCAL STRING ARQC`);
        print_Script(`LOCAL STRING MAC`);
        print_Script(`LOCAL STRING UDK "11223344006677881122334455007788"`);
        print_Script(`LOCAL STRING MDK "8B4F854F0831FBF2635A212E4DDDB92A"`);
        print_Script(`LOCAL STRING ENC "11223344006677881122334455007788"`);
        print_Script(`LOCAL STRING AID_PSE "315041592E5359532E4444463031"`);
        print_Script(`LOCAL STRING AID_PPSE "325041592E5359532E4444463031"`);
        print_Script(`LOCAL STRING AID_PBOC "A0000003330101"`);

    },
    error_check: (line) => {
        print_Script('// ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        print_Script(`// comment : ${line}`);
        print_Script(`COMPARE "00" "FF" 0`);
        print_Script('// ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    },
    set_cmd : (command, data, sw) => {
        var ins = command.substr(2, 2);

        print_Script('');

        switch(ins)
        {
            case 'A4' : {
                
                AID = data;
                if (AID == 'A0000003330101') {
                    print_Script('// SELECT PBOC');
                }
                else if (AID == '315041592E5359532E4444463031') {
                    print_Script('// SELECT PSE');
                }
                else if (AID == '325041592E5359532E4444463031') {
                    print_Script('// SELECT PPSE');
                }else if (AID == 'A000000003000000') {
                    print_Script('// SELECT ISD');
                }

                
                print_Script(`SET AID "${AID}"`);
                cmd = `GPSELECT USERCARD AID RESP SW "${sw}"`;
                print_Script(cmd);
                print_Script(`JNE SW "${sw}" ERROR_SCRIPT`);
                transaction_num;
            }break;
            case 'A8' : {
                print_Script('// GPO');
                pdol_data = data;
                print_Script(`SET PDOL_DATA "${pdol_data}"`);
                print_Script(`APPEND CMD "${command}" PDOL_DATA`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                print_Script(cmd);
                print_Script(`JNE SW "${sw}" ERROR_SCRIPT`);

                print_Script("");
                print_Script('LEFT TEMP RESP 2');
                print_Script(`JE TEMP "77" TRANSACTION${transaction_num}_GPO_RESPONSE_TAG_77`);
                print_Script(`MID AIP RESP 5 4`);
                print_Script(`MID AFL RESP 9`);
                print_Script(`JMP TRANSACTION${transaction_num}_GPO_RESPONSE_TAG_77_END`);
                print_Script(`TRANSACTION${transaction_num}_GPO_RESPONSE_TAG_77:`)

                print_Script("");
                print_Script(`FINDTLV AIP "82" RESP`);
                print_Script(`FINDTLV AFL "94" RESP`);
                print_Script(`FINDTLV ATC "9F36" RESP`);
                print_Script(`FINDTLV IAD "9F10" RESP`);
                print_Script(`MID CVR IAD 7 8`);
                print_Script(`TRANSACTION${transaction_num}_GPO_RESPONSE_TAG_77_END:`);

                flag_1st_gen_AC = false;
            }break;
            case 'AE' : {
                var flag_num;
                var resp_ac;
                var cdol_data_name;
                if (flag_1st_gen_AC != true) {
                    print_Script('// 1st Generate AC');
                    flag_num = "1st";
                    resp_ac = "RESP_AC1";
                    cdol_data_name = "CDOL1_DATA";
                    flag_1st_gen_AC = true;
                }
                else {
                    print_Script('// 2nd Generate AC');
                    flag_num = "2nd";
                    resp_ac = "RESP_AC2";
                    cdol_data_name = "CDOL2_DATA";
                }
                
                cdol_data = data;
                print_Script(`SET ${cdol_data_name} "${cdol_data}"`);
                print_Script(`APPEND CMD "${command}" ${cdol_data_name}`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                print_Script(cmd);
                print_Script(`JNE SW "${sw}" ERROR_SCRIPT`);

                print_Script("");
                print_Script(`LEFT TEMP RESP 2`);
                print_Script(`JE TEMP "77" TRANSACTION${transaction_num}_${flag_num}_GENERATE_AC_TAG_77`);
                print_Script(`MID ATC RESP 7 4`);
                print_Script(`MID ${resp_ac} RESP 11 16`);
                print_Script(`MID CVR RESP 33 8`);

                print_Script("");
                print_Script(`JMP TRANSACTION${transaction_num}_${flag_num}_GENERATE_AC_TAG_77_END`);
                print_Script(`TRANSACTION${transaction_num}_${flag_num}_GENERATE_AC_TAG_77:`);
                print_Script(`FINDTLV ATC "9F36" RESP`);
                print_Script(`FINDTLV ${resp_ac} "9F36" RESP`);
                print_Script(`FINDTLV IAD "9F36" RESP`);
                print_Script(`TRANSACTION${transaction_num}_${flag_num}_GENERATE_AC_TAG_77_END:`);

                if (flag_num == "1st") {
                    print_Script("");
                    print_Script(`NOT TEMP ATC`);
                    print_Script(`APPEND DATA "000000000000" ATC "000000000000" TEMP`);
                    print_Script(`CIPHER SESK DATA UDK TDES_ENC_ECB`);
                }

                print_Script("");
                print_Script(`APPEND TEMP "${data.substr(0, 48)}" "${data.substr(data.length - 10)}"`);
                print_Script(`APPEND DATA TEMP AIP ATC CVR`);
                print_Script(`PADDING DATA DATA PAD_ISO9797_M2`);
                print_Script(`CIPHER CAC DATA SESK DES_TDES_MAC`);
                print_Script(`COMPARE CAC ${resp_ac} 0`);
            
            }break;
            case 'B2' : {
                print_Script('// Read Record');
                print_Script(`SET CMD "${command}"`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                print_Script(cmd);
                print_Script(`JNE SW "${sw}" ERROR_SCRIPT`);
            }break;
            case 'CA' : {
                print_Script('// Get Data');
                print_Script(`SET CMD "${command}"`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                print_Script(cmd);
                print_Script(`JNE SW "${sw}" ERROR_SCRIPT`);
            }break;
            case 'DA' : {
                print_Script('// Put Data');
                print_Script(`SET CMD "${command}"`);
                // cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                // print_Script(cmd);
                // print_Script(`JNE SW "${sw}" ERROR_SCRIPT`);
            }break;
            case '82' : {
                if (AID == "A0000003330101") {
                    print_Script('// External Authenticate');
                    print_Script(`APPEND DATA "3030" "000000000000"`);
                    print_Script(`XOR DATA CAC DATA`);
                    print_Script(`APPEND DATA DATA "0000000000000000"`);
                    print_Script(`CIPHER ARQC DATA SESK TDES_ENC_ECB`);
                    print_Script(`LEFT ARQC ARQC 16`);
                    print_Script(`APPEND CMD "008200000A" ARQC "3030"`);
                    print_Script(`SENDAPDU USERCARD CMD RESP SW "9000"`);
                    print_Script(`JNE SW "9000" ERROR_SCRIPT`);
                }
            }break;
            case '20' : {
                print_Script('// Verify Pin');
                print_Script(`APPEND CMD "${command}" "${data}"`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                print_Script(cmd);
                print_Script(`JNE SW "${sw}" ERROR_SCRIPT`);
            }break;
            default : {
                print_Script('// Command');
                print_Script(`SET CMD "${command}"`);
                cmd = `SENDAPDU USERCARD CMD RESP SW "${sw}"`;
                print_Script(cmd);
                print_Script(`JNE SW "${sw}" ERROR_SCRIPT`);
            }
        }
    },
    end_script : () => {
        transaction_num = 0;
    }, 
    power_on : () => {
        AID = "";
        pdol_data = "";
        aip = "";
        afl = "";
        atc = "";
        cdol_data = "";
        flag_1st_gen_AC = false;


        print_Script(``);
        print_Script(`// ==========================transaction ${++transaction_num}==========================`);
        print_Script(`// RESET`);
        print_Script(`POWERON USERCARD RESP`);
    },
    script_end : () => {
        print_Script('ERROR_SCRIPT:');
    }
};

