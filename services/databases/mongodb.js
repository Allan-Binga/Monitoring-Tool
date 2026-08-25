const Docker = require("dockerode")
const { exec } = require("child_process")
const util = require("util")

const execAsync = util.promisify(exec)

const docker = new Docker({
    socketPath: "/var/run/docker.sock"
})

const mongoService = async () => {
    const databases = []

    try {
        // Look for MongoDB Docker containers
        const containers = await docker.listContainers({ all: true })

        const mongoContainers = containers.filter(container =>
            container.Image.toLowerCase().includes("mongo:")
        )

        mongoContainers.forEach(container => {
            databases.push({
                id: container.Id,
                engine: "MongoDB",
                source: "docker",
                status: container.State,
                container: container.Names[0].replace("/", ""),
                image: container.Image
            })
        })

        // Look for MongoDB system service
        try {
            const { stdout } = await execAsync("systemctl is-active mongod")

            databases.push({
                id: "mongodb-system",
                engine: "MongoDB",
                source: "systemd",
                status: stdout.trim()
            })
        } catch (error) {
            // MongoDB system service not found or not installed.
            // Ignore and continue.
        }

        return databases
    } catch (error) {
        console.error("MongoDB discovery error:", error)
        return []
    }
}

module.exports = mongoService