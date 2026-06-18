import Sidebar from "../components/Sidebar"
import axios from "axios"
import { endpoint } from "../api"
import { useEffect, useState } from "react"
import { Calendar, ChartLine, Cpu, Database, RotateCw, Server } from "lucide-react"
import { Link } from "react-router-dom"

function Home() {
    const [vpsMetrics, setVpsMetrics] = useState(null)
    const [appsMetrics, setAppsMetrics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)

    //Dashboard Data API and useEffect
    const fetchDashboardData = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) {
                setLoading(true)
            } else {
                setRefreshing(true)
            }

            const [vpsResponse, appsResponse] = await Promise.all([
                axios.get(`${endpoint}/metrics/vps`),
                axios.get(`${endpoint}/metrics/apps`)
            ])

            setVpsMetrics(vpsResponse.data)
            setAppsMetrics(appsResponse.data)
            setError(null)

        } catch (error) {
            console.error(error)
            setError("Failed to load dashboard metrics")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    //useEffect
    useEffect(() => {
        fetchDashboardData(true)

        const interval = setInterval(() => {
            fetchDashboardData(false)
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    //Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        )
    }

    //Error Return
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-500">
                {error}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Page Header */}
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-3xl font-semibold">Dashboard</h2>
                            <p className="text-sm text-gray-600 mt-1">Real-time infrastructure health across your clusters</p>
                        </div>
                        <button
                            disabled={refreshing}
                            onClick={() => fetchDashboardData(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-800 border border-gray-300 rounded-xs text-white text-sm font-medium-500 hover:bg-sky-900 hover:border-sky-500 transition-all active:scale-95 cursor-pointer"
                        >
                            <RotateCw
                                size={16}
                                className={refreshing ? "animate-spin" : ""}
                            />

                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    {/* Bento Grid: System Overview */}
                    <div className="bg-gray-50 border border-gray-300 rounded-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-sky-600/5 rounded-lg">
                                <span className="text-sky-800"><Server /></span>
                            </div>
                            <div>
                                <h2 className="font-medium text-[12px] text-gray-500 uppercase tracking-wider">Server Information</h2>
                                <p className="font-semibold text-md text-black">{vpsMetrics?.server?.hostname} <span className="text-sm font-normal text-outline text-gray-500">/  {vpsMetrics?.server?.platform}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="font-normal text-[12px] text-gray-500 uppercase">Status</p>
                                <div className="flex items-center gap-2 justify-end">
                                    <span className={`w-2 h-2 rounded-full ${vpsMetrics?.status === "healthy"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                        }`}>
                                    </span>
                                    <span className="font-semibold bg-green-50 text-sm text-green-700">Healthy</span>
                                </div>
                            </div>
                            <div className="text-right border-l border-gray-300 pl-8">
                                <p className="font-normal text-[12px] text-gray-500 uppercase">Last Updated</p>
                                <p className="font-mono-md text-mono-md text-gray-600">{vpsMetrics?.timestamp ? new Date(vpsMetrics.timestamp).toLocaleString() : "-"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bento Grid: System Overview */}
                    {/* CPU, Memory Load and Disk Usage */}
                    <div className="grid grid-cols-12 gap-4 mb-6">
                        {/* Health Card - CPU */}
                        <div className="col-span-12 md:col-span-4 bg-gray-50 border border-gray-300 rounded-md p-6 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-gray-200 text-sky-800 rounded-xs">
                                    <Cpu />
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="font-semibold text-gray-500 text-sm tracking-wider uppercase">
                                    CPU Utilization
                                </p>
                                <h3 className="font-semibold text-2xl text-black">{vpsMetrics?.cpu?.usagePercent}
                                    <span className="text-md">
                                        %
                                    </span>
                                </h3>
                            </div>

                            <div className="h-12 w-full flex items-end gap-1">
                                <div className="flex-1 bg-sky-300/10 h-1/2 rounded-t-sm animate-pulse"></div>
                                <div className="flex-1 bg-sky-300/10 h-2/3 rounded-t-sm"></div>
                                <div className="flex-1 bg-sky-300/20 h-1/2 rounded-t-sm"></div>
                                <div className="flex-1 bg-sky-300/20 h-3/4 rounded-t-sm"></div>
                                <div className="flex-1 bg-sky-500/40 h-2/3 rounded-t-sm"></div>
                                <div className="flex-1 bg-sky-600/60 h-4/5 rounded-t-sm"></div>
                                <div className="flex-1 bg-sky-800 h-full rounded-t-sm animate-pulse"></div>
                            </div>
                        </div>

                        {/* Health Card - Memory Load*/}
                        <div className="col-span-12 md:col-span-4 bg-gray-50 border border-gray-300 rounded-md p-6 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-gray-200 text-sky-800 rounded-xs">
                                    <ChartLine />
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="font-semibold text-gray-500 text-sm tracking-wider uppercase">
                                    Memory Load
                                </p>
                                <h3 className="font-semibold text-2xl text-black">{vpsMetrics?.memory?.usagePercent}
                                    <span className="text-2xl">
                                        %
                                    </span>
                                </h3>
                            </div>

                            <div className="h-12 w-full flex items-end gap-1">
                                <div className="flex-1 bg-amber-300/10 h-1/2 rounded-t-sm"></div>
                                <div className="flex-1 bg-amber-300/10 h-2/3 rounded-t-sm"></div>
                                <div className="flex-1 bg-amber-300/20 h-1/2 rounded-t-sm"></div>
                                <div className="flex-1 bg-amber-300/20 h-3/4 rounded-t-sm"></div>
                                <div className="flex-1 bg-amber-500/40 h-2/3 rounded-t-sm animate-pulse"></div>
                                <div className="flex-1 bg-amber-600/60 h-4/5 rounded-t-sm"></div>
                                <div className="flex-1 bg-amber-800 h-full rounded-t-sm"></div>
                            </div>
                        </div>

                        {/* Health Card - Disk Storage*/}
                        <div className="col-span-12 md:col-span-4 bg-gray-50 border border-gray-300 rounded-md p-6 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-gray-200 text-sky-900 rounded-xs">
                                    <Database />
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="font-semibold text-gray-500 text-sm tracking-wider uppercase">
                                    Disk Storage
                                </p>
                                <h3 className="font-semibold text-2xl text-black">{vpsMetrics?.disk?.usagePercent}
                                    <span className="text-2xl font-normal">
                                        %
                                    </span>
                                </h3>
                            </div>

                            <div className="h-12 w-full flex items-end gap-1">
                                <div className="flex-1 bg-slate-300/10 h-1/2 rounded-t-sm"></div>
                                <div className="flex-1 bg-slate-300/10 h-2/3 rounded-t-sm"></div>
                                <div className="flex-1 bg-slate-300/20 h-1/2 rounded-t-sm"></div>
                                <div className="flex-1 bg-slate-300/20 h-3/4 rounded-t-sm"></div>
                                <div className="flex-1 bg-slate-500/40 h-2/3 rounded-t-sm"></div>
                                <div className="flex-1 bg-slate-600/60 h-4/5 rounded-t-sm"></div>
                                <div className="flex-1 bg-slate-800 h-full rounded-t-sm"></div>
                            </div>
                        </div>
                    </div>

                    {/* Main Workspace Split */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Active Applications Table */}
                        <div className="col-span-12 lg:col-span-8 bg-gray-100 border border-gray-300 rounded-xs overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-300 flex justify-between items-center bg-gray-100">
                                <h2 className="font-semibold text-sm text-gray-700">Active Applications</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-300 border-b border-gray-300">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-xs text-black">SERVICE</th>
                                            <th className="px-6 py-3 font-medium text-xs text-black">STATUS</th>
                                            <th className="px-6 py-3 font-medium text-xs text-black text-right">CPU</th>
                                            <th className="px-6 py-3 font-medium text-xs text-black text-right">MEMORY</th>
                                            <th className="px-6 py-3 font-medium text-xs text-black text-right">RESTARTS</th>
                                            <th className="px-6 py-3 font-medium text-xs text-black"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {appsMetrics?.apps?.map(app => (
                                            <tr
                                                key={app.id}
                                                className="bg-white hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <p className="font-semibold text-sm text-black">{app.name}</p>

                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm ${app.status === "online" ? "bg-green-300 text-reen-800" : "bg-red-100 text-red-500"}`}>{app.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-sm">{app.cpuPercent}%</td>
                                                <td className="px-6 py-4 text-right font-medium text-sm">{app.memoryMB} MB</td>
                                                <td className="px-6 py-4 text-right font-bold text-sm">{app.restarts}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        to={`/apps/pm2/${app.name}`}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-800 font-semibold text-sm cursor-pointer hover:text-sky-900">Details</Link>
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Alerts Section */}
                        <div className="col-span-12 lg:col-span-4 bg-gray-100 border border-gray-300 rounded-sm flex flex-col h-full overflow-hidden">
                            <div className="px-6 py-5 border border-gray-300 flex justify-between items-center bg-gray-100">
                                <h2 className="font-semibold text-sm text-gray-700">Recent Alerts</h2>
                                <span className="bg-sky-500/10 text-sky-800 text-[11px] px-2 py-0.5 rounded font-bold">128 LOGS/S</span>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[460px] p-4 space-y-3">

                                {/* Alert Item */}
                                <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-sm transition-all border border-transparent hover:border-gray-400/30">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-error shrink-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Home