const apiConnect = require('./apiRequest');

const apiQuery = "WiseNLU";
const apiArgumentFrame = {"analysis_code":"morp","text":""};
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
 * @param {Object} data - 이중어레이 blankMorp를 품고있습니다.
 * @param {{lemma:string, position:number, type:string}[][]} data.blankMorp - 공백 단위로 묶어둠 ex) [[{감기}],[{걸리},{었},{을}],[{때}]]
 * @returns {{needMorp : {}[][], noNeedMorp : {}[][]}} morp를 needMorp와 noNeedMorp로 나눴습니다.
 * @description 공백 단위로 나뉜 morp를 받아 type과 의미에 따라 2가지로 분류합니다.
 */
const divideMorpbyMean = ( data ) => {
    let blankMorp = data.blankMorp,
        needMorp = [],
        noNeedMorp = [];

    blankMorp.forEach( ( word, j ) => {
        let needMorpTemp = [],
            noNeedMorpTemp = [],
            type = 0,
            check = false;

        word.find( ( Morp ) => {
            if( Morp.type == "VV" )  { type = 1 } ;
            if( Morp.type == "EC" || Morp.type == "EF" ) { type = 2 };
            if( Morp.type == "XSV" ) { type = 3 };
        });
        switch( type ) {
            case 3:
                let checkTemp = true;
                word.forEach( ( morp ) => {
                    if( allowMorpChecklist.indexOf( morp.type ) != -1 ) {
                        checkTemp = false;
                    }
                });

                if( checkTemp == false ) {
                    needMorp.push( word );
                } else {
                    noNeedMorp.push( word );
                };
                break;

            case 2:
                let temp = true;
                if( word[ 0 ].type == "NNG" ) {
                    word.forEach( ( morp ) => {
                        if( allowMorpChecklist.indexOf( morp.type ) != -1 ) { 
                            needMorpTemp.push( morp );
                        } else {
                            noNeedMorpTemp.push( morp );
                        }
                    });
                    if( noNeedMorpTemp.length ) {
                        noNeedMorp.push(noNeedMorpTemp);
                    }
                    if( needMorpTemp.length ) {
                        needMorp.push(needMorpTemp);
                    }
                } else {
                    if( blankMorp.length > j + 1 ) {
                        blankMorp[ j + 1 ].forEach( ( morp ) => {
                            if( allowMorpChecklist.indexOf( morp.type ) != -1 ) {
                                temp = false;
                            }
                        });
                    } else {
                        temp == true;
                    }
                    if( temp == false ) { 
                        needMorp.push( word )
                    } else {
                        noNeedMorp.push( word );
                    }
                }
                break;

            case 1:
                word.forEach( ( Morp ) => {
                    if( vvMorpChecklist.indexOf( Morp.type ) != -1 ) {
                        check = true;
                        needMorp.push( word );
                    }
                });
                if( check == false ) {
                    noNeedMorp.push(word);
                }
                break;
        
            case 0:
                word.forEach( ( Morp ) => {
                    if( allowMorpChecklist.indexOf( Morp.type ) != -1 ) {
                        needMorpTemp.push( Morp );
                    } else { 
                        noNeedMorpTemp.push( Morp );
                    }
                });
                if( noNeedMorpTemp.length > 0 ) { 
                    noNeedMorp.push( noNeedMorpTemp );
                }
                if( needMorpTemp.length > 0 ) {
                    needMorp.push( needMorpTemp );
                }
                break;
        }
    });
    
    return [ needMorp, noNeedMorp ];
}

/**
 * @param {String} originalText - 원래 문장입니다.
 * @param {{lemma:string, position:number, type:string}[][]} needMorp - 공백 단위로 묶어둠 ex) [[{감기}],[{걸리},{었},{을}],[{때}]]
 * @returns {String} 필요한 단어만 남겨둔 문장입니다.
 * @description 필요한 morp와 원문 텍스트를 이용해 문장에서의 키워드를 분석해 문장으로 만들어 줍니다.
 */
const makeKeyword = ( originalText, needMorp ) => {
    let keyword = "",
        bytePos = 0,
        tempPos = 0,
        plusUntil = 0,
        blankPos = [],
        WordBlankPos = [],
        isAdding = false;

    needMorp.forEach( ( needMorpWord, i ) => {
        needMorpWord.forEach( ( Morp, j ) => {
            if( i == 0 && j == 0 ) {
                WordBlankPos = [ Morp.position, Buffer.byteLength( Morp.lemma ) ];
            } else {
                if( WordBlankPos[ 0 ] <= Morp.position && WordBlankPos[ 0 ] + WordBlankPos[ 1 ] >= Morp.position ) {
                    if(  WordBlankPos[ 0 ] + WordBlankPos[ 1 ] < Morp.position + Buffer.byteLength( Morp.lemma ) ) {
                        WordBlankPos[ 1 ] += Buffer.byteLength( Morp.lemma );
                    }
                } else {
                    blankPos.push( WordBlankPos );
                    WordBlankPos = [ Morp.position, Buffer.byteLength( Morp.lemma ) ];
                }
            }
        });
    });
    blankPos.push( WordBlankPos );
     // break 사용위해
    for( let i = 0; i < originalText.length; i++ ) {    
        if( blankPos.length-1 < tempPos ) {
            break;
        } 
        if( bytePos == blankPos[ tempPos ][ 0 ] ) {
            isAdding = true;
        }
        if( isAdding == true ) {
            keyword += originalText[ i ];
            plusUntil += Buffer.byteLength( originalText[ i ] );

            if( plusUntil == blankPos[ tempPos ][ 1 ] ) {
                plusUntil = 0;
                tempPos++;
                isAdding = false;
                if( originalText[ i + 1 ] == ' ' ) {
                    if( keyword[ keyword.length - 1 ] != ' ' ) {
                        keyword+=' ';
                    }
                }
            }    
        }
        bytePos += Buffer.byteLength( originalText[ i ] );
    };
    return keyword;
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
    
    let divideMorp = divideMorpbyMean( divideMorpbyBlank ( { "morps" : result.morps.originalMorp, "text" : result.originalText } ) );
    result.morps.needMorp = divideMorp[0], result.morps.noNeedMorp = divideMorp[1];

    let keyword = makeKeyword(result.originalText,result.morps.needMorp); 
    result.keywordText = keyword;

    return result;
}

module.exports = textAnalystic;