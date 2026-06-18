const express = require("express")
const {appDetails, startApp, stopApp, restartApp, deleteApp} = require("../controllers/pm2")

const router = express.Router()

//Routes
router.get("/apps/:name/details", appDetails)
router.post("/apps/:name/start", startApp)
router.post("/apps/:name/stop", stopApp)
router.post("/apps/:name/restart", restartApp)
router.delete("/apps/:name/delete", deleteApp)

module.exports = router