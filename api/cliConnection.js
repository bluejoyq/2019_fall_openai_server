const textAnalytic=require('./textAnalystic');
const search=require('./search');
const machineRead = require('./machineRead');
/** 
 * @param req - request
 * @param req.body.data - client에서 보내는 데이터 req.body.data.text에 검색할 문장을 담아야 합니다
 * @description client와 데이터를 받아 통신하는 함수입니다
*/
const cliConnection = async ( req, res ) => { 
    let clientData,
        analyzeData;

    try {
        clientData = JSON.parse( req.body.data );
        if( !clientData.text.replace( /\s/g, '' ).length ) {
            throw new Error( "client text empty" );
        }
    }
    catch ( err ) {
        console.log( err );
        res.json( { "return_code" : -1, "error_code" : err.message } );
        res.status( 403 );
        return false;
    }

    try {
        analyzeData = await textAnalytic( clientData );
    }
    catch ( err ) {
        console.log( err );
        res.json( { "return_code" : -1, "error_code" : err.message } );
        res.status( 403 );
        return false;
    }
    let searchData = await Promise.all( [ search.naver( analyzeData.keywordText ), search.google( analyzeData.keywordText ) ] );
    searchData = searchData[ 0 ].concat( searchData[ 1 ] );

    searchData = await machineRead( searchData, analyzeData.keywordText );
    analyzeData.searchResults = searchData;

    res.send( { "return_code" : 0, "return_data" : analyzeData } );
    res.status( 200 );
};  

/**
 * @description 기능을 테스트 하기 위한 함수입니다.
 */
const run = async () => {
    let keywordText = "2019년 고등학교 1학년 교육과정은 어떻게 되나요?"
    let startTime = new Date().getTime();
    let x = await textAnalytic({"text":keywordText});
    //let searchResults = await Promise.all( [ search.naver(x.keywordText), search.google(x.keywordText) ] );
    //searchResults = searchResults[0].concat(searchResults[1]);
    // =  await machineRead(searchResults,keywordText);
    let endTime = new Date().getTime();
    
    console.log("result",x.morps.originalMorp);
    console.log("메인run 걸리는 시간 :",endTime - startTime);
    //console.log(searchResults);
};

//run();
module.exports = cliConnection;