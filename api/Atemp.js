const rp = require('request-promise');

const list = [1,2,3,4,5,6,7,8]

const delay =(n)=>{
    return new Promise(resolve =>{
        resolve(n);
    })
} 

const test = async(item) => {
    await delay(10);
    console.log(item);
}


const run = async () => {
    const promises = list.map((elem,index)=>{
        return test(elem);
    });

    await Promise.all(promises);
}

run();