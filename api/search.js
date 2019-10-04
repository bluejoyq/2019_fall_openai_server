require('dotenv').config();
const rp = require("request-promise");
const cheerio = require("cheerio");
const Entities = require('html-entities').XmlEntities;
 
const entities = new Entities();

const searchURL = {
    "naver" : "https://search.naver.com/search.naver?",
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
            let mainHtml =  $( "#main_pack strong" ).parent().html();
            console.log(mainHtml);
            resolve( html );
        })
    })
}



search.naver("경희대 학생 수");
module.exports = search;