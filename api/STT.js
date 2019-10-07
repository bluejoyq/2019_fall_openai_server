const apiConnect = require('./apiConnect');

/**
 * @param {Object} clientData 클라이언트에서 보낸 데이터
 * @param {String} clientData.audio base64로 인코딩된 음성 데이터 16hz로 샘플링 되야함
 * @returns {text:String} 음성을 인식한 결과
 * @description 음성 인식을 요청해 결과를 내놓는 함수이다.
 */
const apiReq = async ( clientData ) => {
    let getSTT = await apiConnect.ETRI( "WiseASR/Recognition", { "language_code" : "korean", "audio" : clientData.audio } );
    return { "text" : getSTT.return_object.recognized };
}

/**
 * @param req request
 * @param req.bdoy.data req.bdoy.data.audio에 요청하는 데이터가 들어있어야한다
 * @description 오디로를 텍스트로 바꿔준다. 
 */
const STT = async ( req, res ) => { 
    let clientData = JSON.parse( req.body.data ),
        voiceTemp = await apiReq( clientData );

    res.send( voiceTemp );
    res.status( 200 );
};

module.exports=STT;