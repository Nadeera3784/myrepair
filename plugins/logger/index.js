const logger_route = require('./router.js');
const fs         = require('fs');

const _plugin_prefix =  "logger";

exports.loader = function(options) {
    const {app} = options;
    app.use('/', logger_route);

}