require('dotenv').config();
const rp = require("request-promise");

const URL = {
    "ETRI" : "http://aiopen.etri.re.kr:8000/",
    "Korean" : "https://search.naver.com/p/csearch/ocontent/util/SpellerProxy?_callback=&color_blindness=0&q="
}

const apiRequestJsonFrame = {
	"request_id" : "reserved field",
	"access_key" : process.env.ETRI_API_KEY,
	"argument" : {}   
};
            
let apiRequest = {};

/** 
 * @param {String} query 세부 url / 형식은 api사이트 참조
 * @param {Object} argument 필요한 argument / 형식은 api사이트 참조
 * @returns {Object} api사이트에서 정해진 형식의 응답을 받아옵니다. 
 * @description 이 함수는 이미 정해진 url(etri api)+query의
    경로로 argument와 함께 request를 보냅니다.
    그 후 얻은 응답을 js object로 보내줍니다.
*/
apiRequest.ETRI = async ( query, argument ) => {
    return new Promise( ( resolve, reject ) => { 
        let apiReqJson = apiRequestJsonFrame;
        apiReqJson.argument = argument;
        let apiReqOption = { uri : URL.ETRI + query, body : JSON.stringify( apiReqJson ) };
        
        rp.post( apiReqOption )
        .then( ( body ) => {
            body = JSON.parse( body );
            if( body.result == "-1" ) {
                throw new Error( body.reason );
            }
            resolve( body );
        })
        .catch( ( err ) => {
            reject( err );
        });       
    })  
}

/** 
 * @param {String} text 고치고 싶은 문장
 * @returns {Object} 정해진 형식의 응답을 보내줍니다.
 * @description 네이버 맞춤법 사이트로 text를 보내서 응답을 받아옵니다.
*/
apiRequest.Korean = async ( text ) => {
    return new Promise( ( resolve,reject ) => {
        rp( { "uri" : URL.Korean+encodeURI( text ) } )
        .then( ( body ) => {
            body = body.substring( 1, body.length - 2 );
            resolve( JSON.parse( body ).message.result );
        })
        .catch( ( err ) => {
            throw new err( err );
        });
    });
}

const simpleETRI = ( apiReqOption ) => {
    return new Promise( ( resolve, reject ) => { 
        rp.post( apiReqOption )
        .then( ( body ) => {
            resolve(JSON.parse( body ).return_object.MRCInfo.confidence);
        })
        .catch( ( err ) => {
            console.log(err.message);
        });
    })
}

const searchLoop = async ( searchResults, keywordText ) =>{
    let tempResults = [];
    await searchResults.forEach( async ( searchResult , index ) => {
        let apiReqJson = apiRequestJsonFrame;
    
        apiReqJson.argument = { "passage" : searchResult.passage, "question" : keywordText };
        apiReqJson.access_key = process.env[ "ETRI_API_KEY_" + index ];
        let apiReqOption = { uri : URL.ETRI + "MRCServlet", body : JSON.stringify( apiReqJson ) };
        searchResult.confidence = await simpleETRI( apiReqOption );
        tempResults.push(searchResult);
        console.log("!",searchResult);
        console.log("?",tempResults);
    });

    return tempResults;
}
apiRequest.multiETRI = async ( searchResults, keywordText ) => {
    let tempResults = await searchLoop( searchResults, keywordText );
    console.log("파이널",tempResults);
    return tempResults;
}
//apiRequest.multiETRI("a",1);


module.exports = apiRequest;

