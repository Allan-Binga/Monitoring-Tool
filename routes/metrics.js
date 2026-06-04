const express = require("express")
const { getVPSMetrics, getPM2AppsMetrics } = require("../controllers/metrics")

const router = express.Router()

//Routes
router.get("/vps", getVPSMetrics)
router.get("/apps", getPM2AppsMetrics)

module.exports = router