"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var port = parseInt(process.argv[2] || 4321);

app.listen(port, function () {
    console.log("server running at port " + port);
});
