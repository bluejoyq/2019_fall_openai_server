const apiConnect = require('./apiRequest');

/**
 * @param {{url:string,title:string,passage:string}[]} searchResults 검색 결과 정리한것.
 * @param {string} keywordText 기계독해 시킬 질문의 텍스트
 * @returns {{url:string,title:string,passage:string,confidence:number}[]} searchResults의 각 object에 confidence 속성을 추가해 돌려준다.
 * @description 기계독해를 사용하는 함수
 */
const machineRead = async ( searchResults, keywordText ) => {
    let begin = 0,
        end = 5;

    for( ; begin < searchResults.length; begin += 5, end += 5 ) {
        let tempResults = [];
        if( end > searchResults.length ) {
            end = searchResults.length;
        }
        tempResults = await apiConnect.multiETRI( searchResults.slice[ begin, end ], keywordText );
        for( let num = begin; num < end; num++ ) {
            searchResults[ num ] = tempResults[ num] ;
        }
    }
    return searchResults;
}


module.exports = machineRead;   