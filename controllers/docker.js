const Docker = require("dockerode")

//Initialize Docker
const docker = new Docker()

//Get Docker Apps
const getApps = async (req, res) => {
    try {
        const containers = await docker.listContainers({ all: true })

        const apps = containers.map(container => ({
            id: container.Id,
            name: container.Names[0]?.replace("/", ""),
            image: container.Image,
            state: container.State,
            status: container.Status,
            created: container.Created,
            ports: container.Ports
        }))

        const summary = {
            runningApps: 0,
            stoppedApps: 0,
            createdApps: 0,
            exposedPorts: 0
        }

        containers.forEach(container => {
            switch (container.State) {
                case "running":
                    summary.runningApps++
                    break

                case "exited":
                    summary.stoppedApps++
                    break

                case "created":
                    summary.createdApps++
                    break
            }

            summary.exposedPorts += container.Ports.length
        })

        return res.json({
            success: true,
            summary,
            apps
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Container Stats/Details
const containerStats = async (req, res) => {
    try {
        const { id } = req.params

        const container = docker.getContainer(id)

        const info = await container.inspect()

        const isRunning = info.State.Running

        // UPTIME

        let uptime = null

        if (info.State.StartedAt) {
            const startedAt = new Date(info.State.StartedAt)

            const uptimeSeconds = Math.floor(
                (Date.now() - startedAt.getTime()) / 1000
            )

            const days = Math.floor(uptimeSeconds / 86400)
            const hours = Math.floor((uptimeSeconds % 86400) / 3600)
            const minutes = Math.floor((uptimeSeconds % 3600) / 60)

            uptime = `${days}d ${hours}h ${minutes}m`
        }

        // NETWORK DETAILS
      
        const network =
            Object.values(info.NetworkSettings.Networks || {})[0] || {}

        // PORT MAPPINGS

        const ports = []

        Object.entries(
            info.NetworkSettings.Ports || {}
        ).forEach(([containerPort, bindings]) => {

            if (!bindings) return

            bindings.forEach(binding => {
                ports.push({
                    containerPort,
                    hostPort: binding.HostPort,
                    hostIp: binding.HostIp
                })
            })
        })

        // ENV VARIABLES

        const env = (info.Config.Env || []).map(variable => {
            const [key, ...value] = variable.split("=")

            return {
                key,
                value: value.join("=")
            }
        })


        // METRICS

        let metrics = null

        if (isRunning) {
            const stats = await container.stats({
                stream: false
            })

            // CPU %
            let cpuPercent = 0

            const cpuDelta =
                stats.cpu_stats?.cpu_usage?.total_usage -
                stats.precpu_stats?.cpu_usage?.total_usage

            const systemDelta =
                stats.cpu_stats?.system_cpu_usage -
                stats.precpu_stats?.system_cpu_usage

            if (
                cpuDelta > 0 &&
                systemDelta > 0
            ) {
                cpuPercent =
                    (
                        (cpuDelta / systemDelta) *
                        (stats.cpu_stats?.online_cpus || 1) *
                        100
                    ).toFixed(2)
            }

            // Memory
            const memoryUsage =
                stats.memory_stats?.usage || 0

            const memoryLimit =
                stats.memory_stats?.limit || 0

            const memoryPercentage =
                memoryLimit > 0
                    ? (
                        (memoryUsage / memoryLimit) *
                        100
                    ).toFixed(2)
                    : 0

            // Network
            let rxBytes = 0
            let txBytes = 0

            Object.values(stats.networks || {}).forEach(net => {
                rxBytes += net.rx_bytes || 0
                txBytes += net.tx_bytes || 0
            })

            metrics = {
                cpuPercent,

                memory: {
                    usageMB: (
                        memoryUsage /
                        1024 /
                        1024
                    ).toFixed(2),

                    limitMB: (
                        memoryLimit /
                        1024 /
                        1024
                    ).toFixed(2),

                    percentage: memoryPercentage
                },

                networkIO: {
                    rxBytes,
                    txBytes
                }
            }
        }

        return res.json({
            success: true,

            container: {
                id: info.Id,
                name: info.Name.replace("/", ""),
                image: info.Config.Image,

                state: info.State.Status,
                running: info.State.Running,

                startedAt: info.State.StartedAt,
                finishedAt: info.State.FinishedAt,

                uptime,
                restartCount: info.RestartCount,

                env,
                ports,

                network: {
                    mode: info.HostConfig.NetworkMode,
                    ipAddress: network.IPAddress || null,
                    gateway: network.Gateway || null,
                    macAddress: network.MacAddress || null
                }
            },

            metrics
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Container Mgt.
const startContainer = async (req, res) => {
    try {

        const { id } = req.params

        const container = docker.getContainer(id)

        await container.start()

        return res.json({
            success: true,
            message: "Container started."
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Stop Container
const stopContainer = async (req, res) => {
    try {

        const { id } = req.params

        const container = docker.getContainer(id)

        await container.stop()

        return res.json({
            success: true,
            message: "Container stopped."
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Restart
const restartContainer = async (req, res) => {
    try {

        const { id } = req.params

        const container = docker.getContainer(id)

        await container.restart()

        return res.json({
            success: true,
            message: "Container restarted."
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Fetch Container Logs
const containerLogs = async (req, res) => {

    const container = docker.getContainer(req.params.id)

    const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 400
    })

    const cleanLogs = logs.toString("utf8")

    return res.json({
        success: true,
        logs: cleanLogs
    })
}

module.exports = { getApps, containerStats, startContainer, stopContainer, restartContainer, containerLogs }