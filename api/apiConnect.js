require('dotenv').config();
const rp = require("request-promise");
const cheerio = require("cheerio");

const URL = "http://aiopen.etri.re.kr:8000/";
const koreanURL = "https://search.naver.com/p/csearch/ocontent/util/SpellerProxy?_callback=&color_blindness=0&q=";
const requestJson = {
	"request_id": "reserved field",
	"access_key": process.env.API_KEY,
	"argument": {
	}
};
            
let apiConnect = {};

apiConnect.apiRequest=async(query,argument)=>{

    return new Promise((resolve,reject)=>{
        let reqJson = requestJson;
        reqJson.argument = argument;

        let option = {
            uri: URL+query,
            body: JSON.stringify(reqJson),
        }
        rp.post(option)
            .then((body)=>{
                resolve(JSON.parse(body));
            })
            .catch((err)=>{
                console.log("Http Request Error");
                console.log(err.response.body);
            });
    });
}
apiConnect.koreanRequest=async(text)=>{
    return new Promise((resolve,reject)=>{
        rp({"uri":koreanURL+encodeURI(text)})
        .then((body)=>{
            body = body.substring(1,body.length-2);
            resolve(JSON.parse(body));
        });
    });
}

module.exports = apiConnect;