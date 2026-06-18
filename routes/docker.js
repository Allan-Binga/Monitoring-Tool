const express = require("express")
const { getApps, containerStats, startContainer, stopContainer, restartContainer, containerLogs } = require("../controllers/docker")

const router = express.Router()

//Routes
router.get("/apps", getApps)
router.get("/container/:id", containerStats)
router.get("/container/:id/logs", containerLogs)
router.post("/container/:id/start", startContainer)
router.post("/container/:id/stop", stopContainer)
router.post("/container/:id/restart", restartContainer)

module.exports = router