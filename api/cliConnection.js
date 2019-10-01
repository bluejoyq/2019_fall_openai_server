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
    let x = await textAnalytic({"text":"2019년 고등학교 1학년 교육과정은 어떻게 되나요?"});
    let endTime = new Date().getTime();

    console.log(endTime - startTime);
    //console.log(typeof(x));
    console.log(x); 
};

run();
module.exports=cliConnection; 