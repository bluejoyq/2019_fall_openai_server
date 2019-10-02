const apiConnect = require('./apiConnect');
const search = require('./search');

const apiRequest= apiConnect.apiRequest;
const koreanRequest = apiConnect.koreanRequest;

const textMean = "WiseNLU";
const argumentFrame = {
    "analysis_code":"morp",
    "text":""
};

const fineMorp = [ "NNG","NNP","NNB","VA","MM","MAG","SL","SH","SN","XPN","XSN","XSA","ETM"]
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
            if(pos==posArray.length || posArray[pos]>morp.position) temp.push(morp);
            else{
                result.push(temp);
                pos++;
                temp=[];
                temp.push(morp);
            }
        });
        result.push(temp);

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
            if(morp.type=="EC"|| morp.type == "EF") type=2;
            if(morp.type == "XSV") type = 3;
        })
        switch(type){
            case 3:
                let checkTemp = true;
                data[j].forEach((morp)=>{
                    if(fineMorp.indexOf(morp.type)!=-1) checkTemp = false});
                if(checkTemp == false) need.push(data[j])
                else notNeed.push(data[j]);
                break;

            case 2:
                let temp = true;
                if(data[j][0].type=="NNG"){
                    data[j].forEach((morp)=>{
                        if(fineMorp.indexOf(morp.type)!=-1) needTemp.push(morp);
                        else notNeedTemp.push(morp);
                    })
                    if(notNeedTemp.length > 0) notNeed.push(notNeedTemp);
                    if(needTemp.length > 0) need.push(needTemp);
                }
                else{
                    if(data.length>j+1){
                        data[j+1].forEach((morp)=>{if(fineMorp.indexOf(morp.type)!=-1) temp = false;});
                    }
                    else{
                        temp == true;
                    }
                    if(temp == false) need.push(data[j])
                    else notNeed.push(data[j]);
                }
                break;

            case 1:
                for(let i = 0; i < data[j].length; i++){
                    if(vvCheck.indexOf(data[j][i].type)!=-1){
                        check = true;
                        need.push(data[j]);
                    }
                }
                if(check == false) notNeed.push(data[j]);
                break;
        
            case 0:
                data[j].forEach((morp)=>{
                    if(fineMorp.indexOf(morp.type)!=-1) needTemp.push(morp);
                    else notNeedTemp.push(morp);
                })
                if(notNeedTemp.length > 0) notNeed.push(notNeedTemp);
                if(needTemp.length > 0) need.push(needTemp);
                break;
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