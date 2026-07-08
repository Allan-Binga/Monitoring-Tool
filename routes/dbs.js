const express = require("express")
const { dbs } = require("../controllers/dbs")

const router = express.Router()

router.get("/databases", dbs)

module.exports = router