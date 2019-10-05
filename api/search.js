const rp = require("request-promise");
const cheerio = require("cheerio");
const Entities = require('html-entities').XmlEntities;

const entities = new Entities();

const searchURL = {
    "naver" : "https://search.naver.com/search.naver?",
    "google" : "https://www.google.com/search?"
}

/**
 * @param main (string) 검색할 사이트의 메인 내용이 들어있는 셀렉터를 줘야합니다.
 * @param keywordText (string) 분석할 키워드의 내용
 * @param html (string) html 파싱한 내용
 * @param naverURL (string) url이 없을 경우 달아주는 비상용 원래 링크
 * @returns (list) js object 여러 개를 가진 list를 준다. 각 json의 url, title, text로 접근가능
 * @description html을 크롤링한 데이터에서 url title text를 캐오는 함수이다.
 */
const getHtmlMainNaver = ( main, keywordText, html, naverURL ) => {
    const $ = cheerio.load( html );
    let result = [];

    $( main ).each( (i, elem ) => {
        let keywordCheck = false;

        keywordText.split( ' ' ).forEach( ( Word ) => {
            if( $( elem ).text().indexOf( Word ) != -1 ) {
                keywordCheck = true;
            } 
        });
        
        if( keywordCheck ) {
            let tempText = entities.decode( $( elem ).parent().parent().parent().text()).trim(),
                tempUrl = $( elem ).parent().attr( "href" );
                tempTitle = $( elem ).parent().attr( "title" );

            if( tempUrl == undefined ) {
                tempUrl = naverURL;
            }

            if( tempTitle == undefined || !tempTitle.length ) {
                tempTitle = tempText.split(' ')[0] + "..."; // 타이틀이 없는 경우
            } 
            
            if( !result.length ) {
                if( keywordCheck ){
                    result.push( { "title" : tempTitle, "text" : tempText, "url" : tempUrl } );
                }    
            } else if( keywordCheck ) {
                // 공백 제거하고 비교
                if( result[ result.length - 1 ].text.replace( /\s/g, '' ) != tempText.replace( /\s/g, '' ) ) {
                    result.push( { "title" : tempTitle, "text" : tempText, "url" : tempUrl } );
                }
            }
        }
    });
    return result;
}

/**
 * @param main (string) 검색할 사이트의 메인 내용이 들어있는 셀렉터를 줘야합니다.
 * @param keywordText (string) 분석할 키워드의 내용
 * @param html (string) html 파싱한 내용
 * @param googleURL (string) url이 없을 경우 달아주는 비상용 원래 링크
 * @returns (list) js object 여러 개를 가진 list를 준다. 각 json의 url, title, text로 접근가능
 * @description html을 크롤링한 데이터에서 url title text를 캐오는 함수이다.
 */
const getHtmlMainGoogle = ( main, keywordText, html, googleURL ) => {
    const $ = cheerio.load( html );
    let result = [];

    $( main ).each( (i, elem ) => {
        let keywordCheck = false;

        keywordText.split( ' ' ).forEach( ( Word ) => {
            if( $( elem ).parent().parent().text().indexOf( Word ) != -1 ) {
                keywordCheck = true;
            } 
        });

        if( keywordCheck ) {
            let tempText = entities.decode( $( elem ).parent().parent().parent().text()).trim(),
                tempUrl = decodeURIComponent( $( elem ).attr( "href" ) );
                tempTitle = entities.decode( $( elem ).children("div").text() ); // title 캐오기 수정 가능
            
            if( tempUrl.indexOf( "/url?q=" ) == 0 ) {
                tempUrl = tempUrl.replace( "/url?q=", "" );
            } else if( tempUrl.indexOf( "/search?" ) == 0 ) {
                tempUrl = "https://google.com" + tempUrl;
            } else { 
                tempUrl = googleURL;
            }

            if( tempTitle == undefined || !tempTitle.length ) {
                tempTitle = tempText.split(' ')[0] + "...";
            }

            if( !result.length ) {
                if( keywordCheck ) {
                    result.push( { "title" : tempTitle, "text" : tempText, "url" : tempUrl } );
                }    
            } else if( keywordCheck ) {
                // 공백 제거하고 비교
                if( result[ result.length - 1 ].text.replace( /\s/g, '' ) != tempText.replace( /\s/g, '' ) ) {
                    result.push( { "title" : tempTitle, "text" : tempText, "url" : tempUrl } );
                }
            }
        }
    });
    return result;
}

const search = {};

/**
 * @param keywordText (string) 검색할 내용
 * @returns (list) js object 여러 개를 가진 list를 준다. 각 json의 url, title, text로 접근가능
 * @description 네이버에서 키워드의 내용을 크롤링해온다.
 */
search.naver = ( keywordText ) => {
    return new Promise( async ( resolve, reject ) => {
        let naverMain = "#main_pack strong",
            result = [],
            naverURL = searchURL.naver + "query=" + encodeURI( keywordText );
        rp( { 
            "uri" : naverURL, 
        } )
        .then( ( html ) => { 
            result = getHtmlMainNaver( naverMain, keywordText, html, naverURL );
            resolve( result );
        })
    })
}

/**
 * @param keywordText (string) 검색할 내용
 * @returns (list) js object 여러 개를 가진 list를 준다. 각 json의 url, title, text로 접근가능
 * @description 구글에서 키워드의 내용을 크롤링해온다.
 */
search.google = ( keywordText ) => {
    return new Promise( ( resolve, reject ) => {
        let googleMain = "#main a", 
            result = [],
            googleURL = searchURL.google + "q=" + encodeURI( keywordText )

        rp( {
            "uri" : googleURL,
        })
        .then( ( html ) => {
            result = getHtmlMainGoogle( googleMain, keywordText, html, googleURL );
            resolve( result );
        })
    })
}

const run=async()=>{
    let startTime = new Date().getTime();
    let result = {};
    [result.naver,result.google]=await Promise.all( [ search.naver("경희대 학생 수"), search.google("경희대 학생 수") ] );
    let endTime = new Date().getTime();
    console.log("serach run 걸리는 시간 :",endTime - startTime);
    console.log("네이이ㅣㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ버",result.naver);
    console.log("구ㅜㅜㅜㅜㅜㅜ구ㅜㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ글",result.google);
}

run();

module.exports = search;