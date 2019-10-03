const textAnalytic=require('./textAnalystic');
const STT = require('./STT');

const cliReq=async(req,res)=>{ // 미완성 함수
    let getData = JSON.parse(req.body.data);

    if(getData.type =="voice") getData = await STT(getData);
    let result = await textAnalytic(getData);
};

//테스트용 지우지마
const run=async()=>{
    let startTime = new Date().getTime();
    let x = await textAnalytic({"text":"2019년 고등학교 1학년 교육과정은 어떻게 되나요?"});
    let endTime = new Date().getTime();
    //console.log(typeof(x));
    console.log("need",x.morp.needMorp); 
    console.log("notneed",x.morp.noNeedMorp); 
    console.log("result",x);
    console.log("걸리는 시간 :",endTime - startTime);
};

run();
module.exports=cliReq; 