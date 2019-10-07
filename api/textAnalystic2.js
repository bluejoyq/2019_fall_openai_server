const apiConnect = require('./apiRequest');

const apiQuery = "WiseNLU";
const apiArgumentFrame = {"analysis_code":"dparse","text":""};
const allowMorpChecklist = [ "NNG","NNP","NNB","VA","MM","MAG","SL","SH","SN","XPN","XSN","XSA","ETM"];
const vvMorpChecklist = ["ETM","ETN"];

/**
 * @param {Object} data - morp 분석 결과와 원문 텍스트가 담김
 * @param {{lemma:string, position:number, type:string}[]} data.morps - morp 분석 결과
 * @param {String} data.text - 검색 원문 텍스트 
 * @returns {Object} returns.result = 결과 list
 * @description morp 분석 결과를 원문과 비교해서 공백 단위의 리스트로 묶어서 반환해줍니다.
 */
const divideMorpbyBlank = ( data ) => {
    let tempPos = 0,
        blankPos = [],
        morpTemp = [],
        blankMorp = [];

    for( let ch of data.text ) {
        if( ch == ' ' ) {
            blankPos.push( tempPos );
        }
        tempPos += Buffer.byteLength( ch );
    }

    tempPos = 0;
    data.morps.forEach( ( morp ) => {
        if( tempPos == blankPos.length || blankPos[ tempPos ] > morp.position ) { 
            morpTemp.push( morp );
        } else {
            blankMorp.push( morpTemp );
            tempPos++;
            morpTemp = [];
            morpTemp.push( morp );
        }
    });
    blankMorp.push( morpTemp );
    return { "blankMorp" : blankMorp };
}



/**
 * @param {Object} clientData - 클라이언트에서 받아온 데이터 
 * @param {String} clientData.text - 분석할 텍스트
 * @returns {Object} 분석 결과 데이터
 * @description 클라이언트 데이터를 받아 의미를 분석하고 맞춤법을 교정해 돌려줍니다.
 */
const textAnalystic = async ( clientData ) => {
    let result = {};
    result.morps = {};

    let fixedClientData = await apiConnect.Korean( clientData.text );
    result.korean = fixedClientData.message.result;
    result.originalText = result.korean.notag_html;

    let apiArgument = apiArgumentFrame;
    apiArgumentFrame.text = result.originalText;
     
    let getText = await apiConnect.ETRI( apiQuery, apiArgument );
    result.morps.originalMorp = getText.return_object.sentence[0].morp;
    console.log(JSON.stringify(getText.return_object.sentence[0]));
    //console.log(getText.return_object.sentence[0].NE);
    let divideMorp = divideMorpbyMean( divideMorpbyBlank ( { "morps" : result.morps.originalMorp, "text" : result.originalText } ) );
    result.morps.needMorp = divideMorp[0], result.morps.noNeedMorp = divideMorp[1];

    let keyword = makeKeyword(result.originalText,result.morps.needMorp); 
    result.keywordText = keyword;

    return result;
}

module.exports = textAnalystic;