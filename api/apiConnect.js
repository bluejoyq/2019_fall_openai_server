require('dotenv').config();
const rp = require("request-promise");

const apiURL = "http://aiopen.etri.re.kr:8000/";
const koreanURL = "https://search.naver.com/p/csearch/ocontent/util/SpellerProxy?_callback=&color_blindness=0&q=";
const apiRequestJsonFrame = {
	"request_id" : "reserved field",
	"access_key" : process.env.ETRI_API_KEY,
	"argument" : {}   
};
            
let apiConnect = {};

/** 
 * @param query (string) 세부 url / 형식은 api사이트 참조
 * @param argument (jsObject) 필요한 argument / 형식은 api사이트 참조
 * @returns (jsObject) api사이트에서 정해진 형식의 응답을 받아옵니다. 
 * @description 이 함수는 이미 정해진 url(etri api)+query의
    경로로 argument와 함께 request를 보냅니다.
    그 후 얻은 응답을 js object로 보내줍니다.
*/
apiConnect.ETRIapiRequest = async ( query, argument ) => {
    return new Promise( ( resolve, reject ) => { 
        let apiReqJson = apiRequestJsonFrame;
        apiReqJson.argument = argument;
        let apiReqOption = { uri : apiURL+query, body : JSON.stringify( apiReqJson ) };
        rp.post( apiReqOption )
            .then( ( body ) => {
                resolve( JSON.parse( body ) );
            })
            .catch( ( err ) => {
                console.log("Http Request Error");
                console.log(err.response.body);
            });
    })  
}

/** 
 * @param text (string) 고치고 싶은 문장
 * @returns (jsObject) 정해진 형식의 응답을 보내줍니다.
 * @description 네이버 맞춤법 사이트로 text를 보내서 응답을 받아옵니다.
*/
apiConnect.koreanRequest = async ( text ) => {
    return new Promise((resolve,reject)=>{
        rp({"uri":koreanURL+encodeURI(text)})
        .then((body)=>{
            body = body.substring(1,body.length-2);
            resolve(JSON.parse(body));
        });
    });
}

module.exports = apiConnect;