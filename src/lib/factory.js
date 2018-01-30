import HTTPLive from '../index';

/**
 * create custom player
 * @param {Object} config 
 */
export default function(config){
    return function(modules,param){
        return new HTTPLive(Object.assign({},modules,param));
    }.bind(null,config)
}