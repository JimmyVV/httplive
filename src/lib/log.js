class Log{
    constructor(name){
        this.name = name;
    }
    w(...msg){
        console.warn(
`[${this.name}]====> ${new Date().toTimeString()}
              : `,...msg
              );
    }
    l(msg){
        console.log(
`[${this.name}]====> ${new Date().toTimeString()}
              : ${msg}`
              );      
    }
    e(msg){
        console.error(
`[${this.name}]====> ${new Date().toTimeString()}
              : ${msg}`
              );     
    }
    i(msg){
        console.info(
`[${this.name}]====> ${new Date().toTimeString()}
              : ${msg}`
              );    
    }
}

export default Log;