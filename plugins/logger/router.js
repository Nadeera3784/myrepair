const express = require('express');
const router  = express.Router();

const _plugin_prefix =  "logger";

router.get('/admin/tools/'+_plugin_prefix, function (request, response, nexts) {
    response.status(200).json({
        data : "Boom"
    });
});

module.exports = router;