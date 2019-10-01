const apiConnect = require('./apiConnect');
const search = require('./search');

const apiRequest= apiConnect.apiRequest;

const textMean = "WiseNLU";
const argumentFrame = {
    "analysis_code":"morp",
    "text":""
};

const getKeyword=(data)=>{
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

    let arrPos = 0;
    data.morps.forEach(morp => {
        if(posArray[arrPos]>morp.position){
            temp.push(morp);
        }
        else{
            console.log(posArray[arrPos]);
            result.push(temp);
            arrPos++;
            temp=[];
            temp.push(morp);
        }
    });
    return result;
}


const textAnalystic=(getData)=>{
    return new Promise(async(resolve,reject)=>{
        let argument = argumentFrame;
        argumentFrame.text = getData.text;

        let result = await apiRequest(textMean,argument);
        let data ={}
        data.morps= result.return_object.sentence[0].morp;
        data.text = result.return_object.sentence[0].text
        console.log(data);
        resolve(getKeyword(data));
    });
    
}

module.exports = textAnalystic;