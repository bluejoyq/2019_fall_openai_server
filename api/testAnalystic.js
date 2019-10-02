const apiConnect = require('./apiConnect');
const search = require('./search');

const apiRequest= apiConnect.apiRequest;
const koreanRequest = apiConnect.koreanRequest;

const textMean = "WiseNLU";
const argumentFrame = {
    "analysis_code":"morp",
    "text":""
};

const fineMorp = [ "NNG","NNP","NNB","VA","MM","SL","SH","SN","XPN","XSN","XSA","ETM"]
const vvCheck = ["ETM","ETN"];


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

    for(let j=0; j < data.length; j++){
        let needTemp = [];
        let notNeedTemp = [];
        let type = 0;
        let check = false;
        data[j].find(morp=>{
            if(morp.type == "VV") type = 1;
            if(morp.type == "XSV") type = 2;
            if(morp.type == "VX" || morp.type == "EF") type = 3;
        })
        if(type == 3){
            notNeed.push(data[j]);
        }
        else if(type == 2){
            let temp = true;
            for(let i = 0; i < data[j].length; i++){
                if(data[j][i].type.indexOf("EC")!=-1){
                    
                    data[j+1].forEach((morp)=>{
                        if(fineMorp.indexOf(morp.type)!=-1) temp = false;
                    });
                }
            }
            if(temp == false) notNeed.push(data[j])
            else need.push(data[j]);
            
        }
        else if(type == 1){
            for(let i = 0; i < data[j].length; i++){
                if(vvCheck.indexOf(data[j][i].type)!=-1){
                    check = true;
                    need.push(data[j]);
                }
            }
            if(check == false){
                notNeed.push(data[j]);
            }
        }
        else if(type == 0){
            data[j].forEach((morp)=>{
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
    }

    return({"need":need,"notNeed":notNeed});
}

const textAnalystic=(getData)=>{
    return new Promise(async(resolve,reject)=>{
        let fixedText = await koreanRequest(getData.text);

        let argument = argumentFrame;
        argumentFrame.text = fixedText.message.result.notag_html;
        let getText = await apiRequest(textMean,argument);

        let data ={"morps":getText.return_object.sentence[0].morp,"text":getText.return_object.sentence[0].text};
        
        let Morp = await getMorp(data).then(getKeyword);
        let result = {
            "originalText":data.text,
            "korean":fixedText.message.result,
            "morp":Morp,
        }
        resolve(result);
    });
    
}

module.exports = textAnalystic;