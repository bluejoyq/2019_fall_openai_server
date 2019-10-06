const apiConnect = require('./apiRequest');

const apiQuery = "MRCServlet";   

/**
 * @param {{url:string,title:string,passage:string}[]} searchResults 검색 결과 정리한것.
 * @param {string} keywordText 기계독해 시킬 질문의 텍스트
 * @returns {{url:string,title:string,passage:string,confidence:number}[]} searchResults의 각 object에 confidence 속성을 추가해 돌려준다.
 * @description 기계독해를 사용하는 함수
 */
const machineRead = async ( searchResults, keywordText ) => {
    for( let searchResult of searchResults ) {
        let tempResult = await apiConnect.ETRI( apiQuery, { "passage" : searchResult.passage, "question" : keywordText } );
        searchResult.confidence = tempResult.return_object.MRCInfo.confidence;
    }
    return searchResults;
}

module.exports = machineRead;   