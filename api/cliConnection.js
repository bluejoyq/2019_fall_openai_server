const express = require('express');
const app = express();
const bodyParser=require('body-parser');
const textAnalytic=require('./testAnalystic');

let cliConnection = {};

cliConnection.cliReq=(req,res)=>{ // 미완성 함수
    let getData = JSON.parse(req.body.data);
    if(getData.type == ("text")){
        textAnalytic(getData)
        .then()
    }
};

//테스트용 지우지마
const run=async()=>{
    let startTime = new Date().getTime();
    let x = await textAnalytic({"text":"감기 걸렸을 때 먹으면 좋은것은?"});
    let endTime = new Date().getTime();
    //console.log(typeof(x));
    console.log("need",x.need); 
    console.log("notneed",x.notNeed); 

    console.log("걸리는 시간 :",endTime - startTime);
};

run();
module.exports=cliConnection; 