const mongoose = require('mongoose');
const redis = require('redis');
const keys = require('../config/keys');
const util = require('util');

const exec = mongoose.Query.prototype.exec;
const redisClient = redis.createClient(keys.redisURI);

redisClient.hget = util.promisify(redisClient.hget);

mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.basekey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function(){

    if(!this.useCache){
        const tmp =  await exec.apply(this, arguments);
        return tmp;
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    const cachedValue = await redisClient.hget(this.basekey, key);

    if(cachedValue){
        console.log("FROM CACHE");
        const doc = JSON.parse(cachedValue);

        return Array.isArray(doc)
                ? doc.map(d=> new this.model(d))
                : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);
    console.log("DB:" + result );
    redisClient.hset(this.basekey, key, JSON.stringify(result));

    return result;
}

module.exports = {
    clearHash(hashKey) {
        redisClient.del(JSON.stringify(hashKey));
    }
}