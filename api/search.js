require('dotenv').config();
const rp = require("request-promise");
const cheerio = require("cheerio");
const Entities = require('html-entities').XmlEntities;
 
const entities = new Entities();

const searchURL = {
    "naver" : "https://search.naver.com/search.naver?",
    "google" : "https://www.google.com/search?"
}

const search = {};

search.naver = ( keywordText ) => {
    return new Promise( ( resolve, reject ) => {
        const result = [];
        rp( { 
            "uri" : searchURL.naver + "query=" + encodeURI( keywordText ), 
            //"headers": { 'X-Naver-Client-Id' : process.env.NAVER_API_ID, 'X-Naver-Client-Secret' : process.env.NAVER_API_KEY } 
        } )
        .then( ( html ) => { // id가 main_pack
            const $ = cheerio.load( html );
            $("script").remove();
            $( "#main_pack strong" ).each((i,elem)=>{
                console.log("텍스트 :",entities.decode($(elem).parent().text()));
                console.log("url :",entities.decode($(elem).parent().attr("href")));
            });
            resolve( html );
        })
    })
}

search.google = (keywordText) => {
    return new Promise((resolve, reject) => {
        rp( {
        "uri" : searchURL.google + "q=" + encodeURI( keywordText ),
        })
        .then((html) => {
            
        })
    })
}



search.naver("경희대 학생 수");
module.exports = search;