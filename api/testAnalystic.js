const apiConnect = require('./apiConnect');
const search = require('./search');

const apiRequest= apiConnect.apiRequest;

const textMean = "WiseNLU";
const argumentFrame = {
    "analysis_code":"morp",
    "text":""
};

const fineMorp = [ "NNG","NNP","NNB","VA","MM","SL","SH","SN","XPN","XSN","XSA","ETM"]
const vvCheck = ["ETM","ETN","EC"];


const getMorp=(data)=>{
    return new Promise((resolve,reject)=>{
        let pos = 0;
        let posArray = [];
        let temp=[]
        let result = [];
        for(let ch of data.text){
            if(ch == ' '){
                posArray.push(pos);
            }
            pos+=Buffer.byteLength(ch);
        }

        pos = 0;
        data.morps.forEach(morp => {
            if(pos==posArray.length){
                temp.push(morp);
                }
            else if(posArray[pos]>morp.position){
                temp.push(morp);
                }
            else{
                result.push(temp); //원형 추가
                pos++;
                temp=[];
                temp.push(morp);
            }
        });
        result.push(temp); //원형 추가

        resolve(result);
    });
}

const getKeyword=(data)=>{
    let need = [];
    let notNeed = [];

    data.forEach((word)=>{
        let needTemp = [];
        let notNeedTemp = [];
        let type = 0;
        let check = false;
        word.find(morp=>{
            if(morp.type == "VV") type = 1;
            if(morp.type == "XSV") type = 2;
            if(morp.type == "VX") type = 3;
        })
        if(type == 3){
            notNeed.push(word);
        }
        else if(type == 2){
            need.push(word);
        }
        else if(type == 1){
            for(let i = 0; i < word.length; i++){
                if(vvCheck.indexOf(word[i].type)!=-1){
                    check = true;
                    need.push(word);
                }
            }
            if(check == false){
                notNeed.push(word);
            }
        }
        else if(type == 0){
            word.forEach((morp)=>{
                if(fineMorp.indexOf(morp.type)!=-1){
                    needTemp.push(morp);
                }
                else{
                    notNeedTemp.push(morp);
                }
            })
            if(notNeedTemp.length > 0) notNeed.push(notNeedTemp);
            if(needTemp.length > 0) need.push(needTemp);
        }
    });

    return({"need":need,"notNeed":notNeed});
}

const textAnalystic=(getData)=>{
    return new Promise(async(resolve,reject)=>{
        let argument = argumentFrame;
        argumentFrame.text = getData.text;
        // 원래 텍스트 보존은?
        let result = await apiRequest(textMean,argument);
        let data ={}
        data.morps= result.return_object.sentence[0].morp;
        data.text = result.return_object.sentence[0].text
        resolve(getMorp(data).then(getKeyword));
    });
    
}

module.exports = textAnalystic;