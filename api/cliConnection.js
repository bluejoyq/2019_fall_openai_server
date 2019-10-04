const textAnalytic=require('./textAnalystic');
const search=require('./search');

/** 
 * @param req req.body.data에 데이터가 들었습니다. data.type에 타입을 명시하고 data.text[나 data.voice에]-수정가능성 데이터를 넣어주세요.
 * @description client와 데이터를 받아 통신하는 함수입니다. 
*/
const clientReq = async ( req , res ) => { 

    let clientData = JSON.parse( req.body.data );

    let analyzeData = await textAnalytic( clientData );

    await search(analyzeData.keywordText);
};

/**
 * @description 기능을 테스트 하기 위한 함수입니다.
 */
const run = async () => {
    let startTime = new Date().getTime();
    let x = await textAnalytic({"text":"달리기 잘하는 방법을 알고 싶어요"});
    let endTime = new Date().getTime();
    let y = await search(x.keywordText);
    //console.log("need",x.morps.needMorp); 
    //console.log("notneed",x.morps.noNeedMorp); 
    console.log("result",x);
    console.log("걸리는 시간 :",endTime - startTime);
};

run();
module.exports = clientReq; 