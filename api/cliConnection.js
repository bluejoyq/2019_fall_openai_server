const textAnalytic=require('./textAnalystic');
const search=require('./search');

/** 
 * @param req - request
 * @param req.body.data - client에서 보내는 데이터 req.body.data.text에 검색할 문장을 담아야 합니다
 * @description client와 데이터를 받아 통신하는 함수입니다
*/
const clientReq = async ( req , res ) => { 

    let clientData = JSON.parse( req.body.data );

    let analyzeData = await textAnalytic( clientData );

    await Promise.all( [ search.naver(x.keywordText), search.google(x.keywordText) ] );
};

/**
 * @description 기능을 테스트 하기 위한 함수입니다.
 */
const run = async () => {
    let startTime = new Date().getTime();
    let x = await textAnalytic({"text":"달리기 잘하는 방법을 알고 싶어요"});
    let [y,z] = await Promise.all( [ search.naver(x.keywordText), search.google(x.keywordText) ] );
    let endTime = new Date().getTime();
    //console.log("need",x.morps.needMorp); 
    //console.log("notneed",x.morps.noNeedMorp); 
    //console.log("result",x);
    console.log("메인run 걸리는 시간 :",endTime - startTime);
};

run();
module.exports = clientReq; 