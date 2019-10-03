const apiConnect = require('./apiConnect');

const apiReq = apiConnect.apiRequest;

const query = "WiseASR/Recognition";
const argumentFrame = {
    "language_code": "korean",
    "audio": ""
}

const STT=async(getData)=>{
    let argument = argumentFrame;
    argument.audio = getData.audio;
    getSTT=await apiReq(query,argument);
    getData.text = getSTT.return_object.recognized;
    return getData;
}

module.exports=STT;