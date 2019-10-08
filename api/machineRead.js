const apiRequest = require('./apiRequest');

/**
 * @param {{url:string,title:string,passage:string}[]} searchResults 검색 결과 정리한것.
 * @param {string} keywordText 기계독해 시킬 질문의 텍스트
 * @returns {{url:string,title:string,passage:string,confidence:number}[]} searchResults의 각 object에 confidence 속성을 추가해 돌려준다.
 * @description 기계독해를 사용하는 함수
 */
const machineRead = async ( searchResults, keywordText ) => {
    let keyNum = 5,
        begin = 0,
        end = keyNum;

    for( ; begin < searchResults.length; begin += keyNum, end += keyNum ) {
        let tempResults = [];
        if( end > searchResults.length ) {
            end = searchResults.length;
        }
        tempResults = await apiRequest.multiETRI( searchResults.slice( begin, end ), keywordText );
        for( let num = begin; num < end; num++ ) {
            searchResults[ num ] = tempResults[ num] ;
        }
    }
    return searchResults;
}


module.exports = machineRead;   