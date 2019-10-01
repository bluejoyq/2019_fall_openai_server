const apiConnect = require('./apiConnect');
const search = require('./search');

const apiRequest= apiConnect.apiRequest;

const textMean = "WiseQAnal";

const textAnalystic=(getData)=>{
    return new Promise(async(resolve,reject)=>{
        let result = await apiRequest(textMean,{"text":getData.text});
        resolve(result);
    });
    
}

module.exports = textAnalystic;