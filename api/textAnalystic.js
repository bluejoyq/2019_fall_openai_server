const apiConnect = require('./apiConnect');
const search = require('./search');

const apiReq= apiConnect.apiRequest;
const koreanReq = apiConnect.koreanRequest;

const query = "WiseNLU";
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

        resolve({"result":result,"text":data.text,"posArray":posArray});
    });
}

const makeKeyword=(originalText,needMorp)=>{
    let keyword = "";
    let bytePos = 0;
    let temp = 0;
    let adding = false;
    let plus = 0;
    let posArray = [];
    for(let word of needMorp){
        word.forEach(elem =>{
            if(posArray.length ==0)
                posArray.push([elem.position,Buffer.byteLength(elem.lemma)]);
            else{
                // 중복 제거
                if(posArray[posArray.length-1][0]!=elem.position||posArray[posArray.length-1][1]!=Buffer.byteLength(elem.lemma))
                    posArray.push([elem.position,Buffer.byteLength(elem.lemma)]);
            }
        });
    }
    for(let i=0; i < originalText.length; i++){
        if(posArray.length-1 < temp) break;
        if(bytePos == posArray[temp][0]){
            adding = true;
        }
        if(adding == true){
            keyword+= originalText[i];
            plus += Buffer.byteLength(originalText[i]);

            if(plus == posArray[temp][1]){
                plus = 0;
                temp++;
                adding = false;
                if(originalText[i+1] == ' ')
                    if(keyword[keyword.length-1]!= ' ') keyword+=' ';
            }    
        }
        bytePos += Buffer.byteLength(originalText[i]);
    };
    return keyword;
}

const getKeyword=(result)=>{
    let data = result.result;
    let originalText = result.text;
    let needMorp = [];
    let noNeedMorp = [];
    let keyword = "";

    for(let j=0; j < data.length; j++){
        let needMorpTemp = [];
        let noNeedMorpTemp = [];
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
                if(checkTemp == false) needMorp.push(data[j])
                else noNeedMorp.push(data[j]);
                break;

            case 2:
                let temp = true;
                if(data[j][0].type=="NNG"){
                    data[j].forEach((morp)=>{
                        if(fineMorp.indexOf(morp.type)!=-1) needMorpTemp.push(morp);
                        else noNeedMorpTemp.push(morp);
                    })
                    if(noNeedMorpTemp.length > 0) noNeedMorp.push(noNeedMorpTemp);
                    if(needMorpTemp.length > 0) needMorp.push(needMorpTemp);
                }
                else{
                    if(data.length>j+1){
                        data[j+1].forEach((morp)=>{if(fineMorp.indexOf(morp.type)!=-1) temp = false;});
                    }
                    else{
                        temp == true;
                    }
                    if(temp == false) needMorp.push(data[j])
                    else noNeedMorp.push(data[j]);
                }
                break;

            case 1:
                for(let i = 0; i < data[j].length; i++){
                    if(vvCheck.indexOf(data[j][i].type)!=-1){
                        check = true;
                        needMorp.push(data[j]);
                    }
                }
                if(check == false) noNeedMorp.push(data[j]);
                break;
        
            case 0:
                data[j].forEach((morp)=>{
                    if(fineMorp.indexOf(morp.type)!=-1) needMorpTemp.push(morp);
                    else noNeedMorpTemp.push(morp);
                })
                if(noNeedMorpTemp.length > 0) noNeedMorp.push(noNeedMorpTemp);
                if(needMorpTemp.length > 0) needMorp.push(needMorpTemp);
                break;
        }
    }
    keyword = makeKeyword(originalText,needMorp); 
    return({"morp":{"needMorp":needMorp,"noNeedMorp":noNeedMorp},"keyword" :keyword});
}

const textAnalystic=async(getData)=>{
    let fixedText = await koreanReq(getData.text); //맞춤법 API

    let argument = argumentFrame;
    argumentFrame.text = fixedText.message.result.notag_html;
    let getText = await apiReq(query,argument);

    let morpText ={"morps":getText.return_object.sentence[0].morp,"text":getText.return_object.sentence[0].text};
    
    let keywordText = await getMorp(morpText).then(getKeyword);

    let result = {
        "originalText":morpText.text,
        "korean":fixedText.message.result,
        "morp":keywordText.morp,
        "keywordText":keywordText.keyword
    }
    return(result);
}

module.exports = textAnalystic;