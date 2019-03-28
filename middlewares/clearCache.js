const { clearHash } = require('../services/cache.js');


module.exports = async (req, res, next) => {
    await next();
    console.log("Cleared from cache");
    clearHash(req.user.id);
}