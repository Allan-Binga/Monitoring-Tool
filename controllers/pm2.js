const pm2 = require("pm2")
const fs = require("fs").promises

// Helper
const connectPm2 = () =>
    new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) return reject(err)
            resolve()
        })
    })

//Remap PM2 path for docker containers
const remapPm2Path = (hostPath) => {
    if (!hostPath) return hostPath
    const hostPm2Home = process.env.HOST_PM2_HOME
    const containerPm2Home = process.env.PM2_HOME || '/root/.pm2'
    if (hostPm2Home) {
        return hostPath.replace(hostPm2Home, containerPm2Home)
    }
    // Fallback: replace any /home/<user>/.pm2 pattern
    return hostPath.replace(/^\/home\/[^/]+\/\.pm2/, containerPm2Home)
}

//View App Details including logs(Single App)
const appDetails = async (req, res) => {
    try {
        const { name } = req.params
        await connectPm2()

        pm2.describe(name, async (err, processDescription) => {
            pm2.disconnect()

            if (err) {
                return res.status(500).json({ success: false, message: err.message })
            }
            if (!processDescription.length) {
                return res.status(404).json({ success: false, message: "Application not found" })
            }

            const app = processDescription[0]
            const logs = { stdout: [], stderr: [] }

            try {
                if (app.pm2_env.pm_out_log_path) {
                    const resolvedPath = remapPm2Path(app.pm2_env.pm_out_log_path)
                    const stdout = await fs.readFile(resolvedPath, "utf8")
                    logs.stdout = stdout.split("\n").slice(-100)
                }
                if (app.pm2_env.pm_err_log_path) {
                    const resolvedPath = remapPm2Path(app.pm2_env.pm_err_log_path)
                    const stderr = await fs.readFile(resolvedPath, "utf8")
                    logs.stderr = stderr.split("\n").slice(-100)
                }
            } catch (logErr) {
                // Log files may not exist yet — non-fatal
                console.warn("Could not read PM2 log files:", logErr.message)
            }

            return res.status(200).json({ success: true, app, logs })
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Start App
const startApp = async (req, res) => {
    try {
        const { name } = req.params

        await connectPm2()

        pm2.start(name, (err) => {
            pm2.disconnect()

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                })
            }

            return res.status(200).json({
                success: true,
                message: `${name} started`
            })
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Stop App
const stopApp = async (req, res) => {
    try {
        const { name } = req.params

        await connectPm2()

        pm2.stop(name, (err) => {
            pm2.disconnect()

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                })
            }

            return res.status(200).json({
                success: true,
                message: `${name} stopped`
            })
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

//Restart App
const restartApp = async (req, res) => {
    try {
        const { name } = req.params

        await connectPm2()

        pm2.restart(name, (err) => {
            pm2.disconnect()

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                })
            }

            return res.status(200).json({
                success: true,
                message: `${name} restarted`
            })
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

//Delete App
const deleteApp = async (req, res) => {
    try {
        const { name } = req.params

        await connectPm2()

        pm2.delete(name, (err) => {
            pm2.disconnect()

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                })
            }

            return res.status(200).json({
                success: true,
                message: `${name} deleted`
            })
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

module.exports = { appDetails, startApp, stopApp, restartApp, deleteApp }