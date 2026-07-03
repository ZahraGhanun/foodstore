const healthService = require("../services/health.service");
const apiResponse = require("../utils/apiResponse");

exports.checkHealth = (req, res) => {

    const result = healthService.getHealthStatus();

    res.json(apiResponse.success(result));

};