const Docker = require("dockerode")
const { exec } = require("child_process")
const util = require("util")

const execAsync = util.promisify(exec)

const docker = new Docker({ socketPath: "/var/run/docker.sock" })

//Postgres Detection Service
const postgresService = async () => {
    const databases = []

    try {
        //Step 1; Look for PostgreSQL docker containers
        const containers = await docker.listContainers({ all: true })

        const postgresContainers = containers.filter(container => container.Image.toLowerCase().includes("postgres"))

        postgresContainers.forEach(container => {
            databases.push({
                id: container.Id,
                engine: "PostgreSQL",
                source: "docker",
                status: container.State,
                container: container.Names[0].replace("/", ""),
                image: container.Image
            })
        })

        //Step 2; Look for PostgreSQL system services
        try {
            const { stdout } = await execAsync("systemctl is-active postgresql")

            databases.push({
                id: "postgres-system",
                engine: "PostgreSQL",
                source: "systemd",
                status: stdout.trim()
            })
        } catch (error) {
            // PostgreSQL system service not found or not installed.
            // Ignore and continue.
        }

        return databases

    } catch (error) {
        console.error("PostgreSQL discovery error:", error)
        return []
    }
}

module.exports = postgresService