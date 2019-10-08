
let a = [1,2,3,4,5,6];


const run= async () =>{
    await a.forEach( b=>{
        b+= 1;
    })
    console.log(a)
}

const bRun = (b) =>{
    b.forEach(elem => {
        console.log(elem)
    });
}
run();

