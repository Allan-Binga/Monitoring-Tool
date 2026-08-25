const Docker = require("dockerode")
const { exec } = require("child_process")
const util = require("util")

const execAsync = util.promisify(exec)

const docker = new Docker({ socketPath: "/var/run/docker.sock" })

const mysqlService = async () => {
    const databases = []

    try {
        //Look for MySQL docker instances
        const containers = await docker.listContainers({ all: true })

        const mysqlContainers = containers.filter(container => container.Image.toLowerCase().includes("mysql:"))

        mysqlContainers.forEach(container => {
            databases.push({
                id: container.Id,
                engine: "MySQL",
                source: "docker",
                status: container.State,
                container: container.Names[0].replace("/", ""),
                image: container.Image
            })
        })

        //Look for running MySQL system services
        try {
            const { stdout } = await execAsync("systemctl is-active mysql")

            databases.push({
                id: "mysql-system",
                engine: "MySQL",
                source: "systemd",
                status: stdout.trim()
            })
        } catch (error) {
            // MySQL system service not found or not installed.
            // Ignore and continue.
        }

        return databases
    } catch (error) {
        console.error("MySQL discovery error:", error)
        return []
    }
}

module.exports = mysqlService