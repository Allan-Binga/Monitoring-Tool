const si = require("systeminformation")
const pm2 = require("pm2")

// Fetch VPS Metrics
const getVPSMetrics = async (req, res) => {
    try {
        const [
            cpu,
            memory,
            disks,
            uptime,
            networkStats,
            osInfo
        ] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.time(),
            si.networkStats(),
            si.osInfo()
        ]);

        // Aggregate all mounted filesystems
        const totalDiskSize = disks.reduce((sum, d) => sum + (d.size || 0), 0);
        const totalDiskUsed = disks.reduce((sum, d) => sum + (d.used || 0), 0);
        const totalDiskAvail = disks.reduce((sum, d) => sum + (d.available || 0), 0);

        const totalDiskUsagePercent =
            totalDiskSize > 0
                ? (totalDiskUsed / totalDiskSize) * 100
                : 0;

        // keep a "representative mount" (root if exists, else first)
        const rootDisk =
            disks.find(d => d.mount === "/") || disks[0];

        // FIXED MEMORY CALCULATION (important change)
        const usedMemory = memory.total - memory.available;
        const usedMemoryPercent = memory.total > 0
            ? (usedMemory / memory.total) * 100
            : 0;

        res.status(200).json({
            server: {
                hostname: osInfo.hostname,
                platform: osInfo.platform,
                uptimeHours: Number(
                    (uptime.uptime / 3600).toFixed(2)
                )
            },

            cpu: {
                usagePercent: Number(cpu.currentLoad.toFixed(2)),
                cores: cpu.cpus.length
            },

            memory: {
                totalGB: Number((memory.total / 1024 ** 3).toFixed(2)),

                // Real used memory (matches system monitor / htop)
                usedGB: Number((usedMemory / 1024 ** 3).toFixed(2)),

                // available is what Linux considers actually usable
                freeGB: Number((memory.available / 1024 ** 3).toFixed(2)),

                usagePercent: Number(usedMemoryPercent.toFixed(2))
            },

            // SAME STRUCTURE, BUT NOW AGGREGATED
            disk: {
                mount: "/", // represents system-wide aggregate
                totalGB: Number((totalDiskSize / 1024 ** 3).toFixed(2)),
                usedGB: Number((totalDiskUsed / 1024 ** 3).toFixed(2)),
                freeGB: Number((totalDiskAvail / 1024 ** 3).toFixed(2)),
                usagePercent: Number(totalDiskUsagePercent.toFixed(2))
            },

            network: {
                rxBytes: networkStats[0]?.rx_bytes || 0,
                txBytes: networkStats[0]?.tx_bytes || 0
            },

            status: "healthy",
            timestamp: new Date()
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch VPS metrics"
        });
    }
};

// Fetch PM2 Apps Metrics
const getPM2AppsMetrics = async (req, res) => {
    try {
        pm2.connect((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "PM2 daemon unavailable",
                    error: err.message
                });
            }

            pm2.list((err, processes) => {
                pm2.disconnect();

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to fetch PM2 processes"
                    });
                }

                const apps = processes.map((app) => ({
                    id: app.pm_id,

                    name: app.name,

                    status: app.pm2_env?.status,

                    uptimeMinutes:
                        app.pm2_env?.pm_uptime
                            ? Math.floor(
                                (Date.now() -
                                    app.pm2_env.pm_uptime) /
                                1000 /
                                60
                            )
                            : 0,

                    restarts:
                        app.pm2_env?.restart_time || 0,

                    cpuPercent:
                        Number(
                            (app.monit?.cpu || 0).toFixed(2)
                        ),

                    memoryMB:
                        Number(
                            (
                                (app.monit?.memory || 0) /
                                1024 /
                                1024
                            ).toFixed(2)
                        ),

                    nodeVersion:
                        app.pm2_env?.node_version || null,

                    script:
                        app.pm2_env?.pm_exec_path || null
                }));

                const summary = {
                    totalApps: apps.length,
                    onlineApps: apps.filter(
                        app => app.status === "online"
                    ).length,
                    stoppedApps: apps.filter(
                        app => app.status !== "online"
                    ).length
                };

                res.status(200).json({
                    summary,
                    apps,
                    timestamp: new Date()
                });
            });
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch PM2 metrics"
        });
    }
};

module.exports = { getVPSMetrics, getPM2AppsMetrics }