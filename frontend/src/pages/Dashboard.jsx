import { useEffect, useState } from "react"
import axios from "axios"
import { endpoint } from "../api"

function Dashboard() {
    const [vpsMetrics, setVpsMetrics] = useState(null)
    const [appsMetrics, setAppsMetrics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [vpsResponse, appsResponse] =
                    await Promise.all([
                        axios.get(`${endpoint}/metrics/vps`),
                        axios.get(`${endpoint}/metrics/apps`)
                    ])

                setVpsMetrics(vpsResponse.data)
                setAppsMetrics(appsResponse.data)

            } catch (error) {
                console.error(error)
                setError("Failed to load dashboard metrics")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()

        const interval = setInterval(fetchDashboardData, 30000)

        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-500">
                {error}
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow bg-white p-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-sky-200 pb-4">
                        <div>
                            <h1 className="text-sm font-semibold text-sky-900">
                                Monitoring Dashboard
                            </h1>

                            <p className="text-xs text-slate-500">
                                Real-time VPS & Application Monitoring
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div
                                className={`h-2 w-2 rounded-full ${vpsMetrics?.status === "healthy"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                    }`}
                            />

                            <span className="text-xs text-slate-700">
                                {vpsMetrics?.status
                                    ? vpsMetrics.status.charAt(0).toUpperCase() + vpsMetrics.status.slice(1)
                                    : "Unknown"}
                            </span>
                        </div>
                    </div>

                    {/* Overview Cards */}
                    <div className="grid gap-4 md:grid-cols-4">

                        {/* CPU */}
                        <div className="rounded-md border border-sky-200 bg-white p-4">
                            <p className="text-xs text-slate-500">
                                CPU Usage
                            </p>

                            <h2 className="mt-2 text-xl font-semibold text-sky-700">
                                {vpsMetrics?.cpu?.usagePercent ?? 0}%
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {vpsMetrics?.cpu?.cores ?? 0} Cores
                            </p>
                        </div>

                        {/* Memory */}
                        <div className="rounded-md border border-sky-200 bg-white p-4">
                            <p className="text-xs text-slate-500">
                                Memory
                            </p>

                            <h2 className="mt-2 text-xl font-semibold text-sky-700">
                                {vpsMetrics?.memory?.usagePercent ?? 0}%
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {vpsMetrics?.memory?.usedGB ?? 0} /
                                {" "}
                                {vpsMetrics?.memory?.totalGB ?? 0} GB
                            </p>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-sky-50">
                                <div
                                    className="h-full bg-sky-500"
                                    style={{
                                        width: `${vpsMetrics?.memory?.usagePercent || 0}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Disk */}
                        <div className="rounded-md border border-red-200 bg-white p-4">
                            <p className="text-xs text-slate-500">
                                Disk Usage
                            </p>

                            <h2 className="mt-2 text-xl font-semibold text-red-500">
                                {vpsMetrics?.disk?.usagePercent ?? 0}%
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {vpsMetrics?.disk?.freeGB ?? 0} GB free
                            </p>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-red-50">
                                <div
                                    className="h-full bg-red-400"
                                    style={{
                                        width: `${vpsMetrics?.disk?.usagePercent || 0}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Uptime */}
                        <div className="rounded-md border border-sky-200 bg-white p-4">
                            <p className="text-xs text-slate-500">
                                Uptime
                            </p>

                            <h2 className="mt-2 text-xl font-semibold text-sky-700">
                                {vpsMetrics?.server?.uptimeHours?.toFixed(0)}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Hours
                            </p>
                        </div>
                    </div>

                    {/* Server Information */}
                    <div className="rounded-md border border-sky-200 bg-white p-5">
                        <h3 className="mb-4 text-xs font-semibold text-sky-900">
                            Server Information
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Hostname
                                </p>

                                <p className="text-xs font-medium text-slate-700">
                                    {vpsMetrics?.server?.hostname}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Platform
                                </p>

                                <p className="text-xs font-medium text-slate-700 capitalize">
                                    {vpsMetrics?.server?.platform}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Status
                                </p>

                                <p className="text-xs font-medium text-green-600">
                                    {vpsMetrics?.status.charAt(0).toUpperCase() + vpsMetrics.status.slice(1)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Last Updated
                                </p>

                                <p className="text-xs font-medium text-slate-700">
                                    {vpsMetrics?.timestamp
                                        ? new Date(
                                            vpsMetrics.timestamp
                                        ).toLocaleString()
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Resource Utilization */}
                    <div className="rounded-md border border-sky-200 bg-white p-5">
                        <h3 className="mb-4 text-xs font-semibold text-sky-900">
                            Resource Utilization
                        </h3>

                        <div className="space-y-4">

                            <div>
                                <div className="mb-1 flex justify-between">
                                    <span className="text-xs text-slate-500">
                                        CPU
                                    </span>

                                    <span className="text-xs text-slate-700">
                                        {vpsMetrics?.cpu?.usagePercent}%
                                    </span>
                                </div>

                                <div className="h-2 rounded-full bg-sky-50">
                                    <div
                                        className="h-full rounded-full bg-sky-500"
                                        style={{
                                            width: `${vpsMetrics?.cpu?.usagePercent || 0}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1 flex justify-between">
                                    <span className="text-xs text-slate-500">
                                        Memory
                                    </span>

                                    <span className="text-xs text-slate-700">
                                        {vpsMetrics?.memory?.usagePercent}%
                                    </span>
                                </div>

                                <div className="h-2 rounded-full bg-sky-50">
                                    <div
                                        className="h-full rounded-full bg-sky-500"
                                        style={{
                                            width: `${vpsMetrics?.memory?.usagePercent || 0}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1 flex justify-between">
                                    <span className="text-xs text-slate-500">
                                        Disk
                                    </span>

                                    <span className="text-xs text-red-500">
                                        {vpsMetrics?.disk?.usagePercent}%
                                    </span>
                                </div>

                                <div className="h-2 rounded-full bg-red-50">
                                    <div
                                        className="h-full rounded-full bg-red-400"
                                        style={{
                                            width: `${vpsMetrics?.disk?.usagePercent || 0}%`
                                        }}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Network */}
                    <div className="grid gap-4 md:grid-cols-2">

                        <div className="rounded-md border border-sky-200 p-4">
                            <p className="text-xs text-slate-500">
                                Received Data
                            </p>

                            <h3 className="mt-2 text-lg font-semibold text-sky-700">
                                {(vpsMetrics?.network?.rxBytes / 1024 ** 3 || 0).toFixed(2)}
                                {" "}GB
                            </h3>
                        </div>

                        <div className="rounded-md border border-sky-200 p-4">
                            <p className="text-xs text-slate-500">
                                Transmitted Data
                            </p>

                            <h3 className="mt-2 text-lg font-semibold text-sky-700">
                                {(vpsMetrics?.network?.txBytes / 1024 ** 3 || 0).toFixed(2)}
                                {" "}GB
                            </h3>
                        </div>
                    </div>

                    {/* PM2 Applications */}
                    <div className="rounded-md border border-sky-200 bg-white p-5">
                        <h3 className="mb-4 text-xs font-semibold text-sky-900">
                            Applications
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-sky-200">
                                        <th className="pb-3">Name</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">CPU</th>
                                        <th className="pb-3">Memory</th>
                                        <th className="pb-3">Restarts</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {appsMetrics?.apps?.map(app => (
                                        <tr
                                            key={app.id}
                                            className="border-b border-slate-100"
                                        >
                                            <td className="py-3 capitalize">
                                                {app.name}
                                            </td>

                                            <td className="py-3">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-[10px] ${app.status === "online"
                                                        ? "bg-sky-50 text-sky-700"
                                                        : "bg-red-50 text-red-500"
                                                        }`}
                                                >
                                                    {app.status}
                                                </span>
                                            </td>

                                            <td>{app.cpuPercent}%</td>

                                            <td>{app.memoryMB} MB</td>

                                            <td>{app.restarts}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>

        </div>
    )
}

export default Dashboard