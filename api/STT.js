const apiConnect = require('./apiConnect');

;

const query = "WiseASR/Recognition";
const argumentFrame = {
    "language_code": "korean",
    "audio": ""
}

const STT=async(getData)=>{
    let argument = argumentFrame;
    argument.audio = getData.audio;
    let getSTT= await apiConnect.ETRIapiRequest( query, argument );
    return { "text" : getSTT.return_object.recognized };
}

const clientReq = async ( req , res ) => { 
    let clientData = JSON.parse( req.body.data );
    let voiceTemp = await STT( clientData );
    res.send(voiceTemp);
};

module.exports=clientReq;