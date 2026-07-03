import axios from "axios"
import Sidebar from "../components/Sidebar"
import { endpoint } from "../api"
import { CheckCircle, CircleCheck, CircleX, Cpu, EllipsisVertical, Filter, Minus, Plus, RotateCw, TrendingUp, TriangleAlert, Grip, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"

function Apps() {
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [summary, setSummary] = useState({
        totalApps: 0,
        onlineApps: 0,
        stoppedApps: 0
    })
    const [error, setError] = useState(null)

    //API
    const fetchApps = async ({
        isInitialLoad = false,
        isManualRefresh = false
    } = {}) => {
        try {
            if (isInitialLoad) {
                setLoading(true)
            }

            if (isManualRefresh) {
                setRefreshing(true)
            }

            const response = await axios.get(`${endpoint}/metrics/apps`)
            setApps(response.data.apps)
            setSummary(response.data.summary)
        } catch (error) {
            console.error(error)
            setError("Failed to load apps.")
        } finally {
            if (isInitialLoad) {
                setLoading(false)
            }

            if (isManualRefresh) {
                setRefreshing(false)
            }
        }
    }

    //Math Helper
    const totalMemory = apps
        .reduce((sum, app) => sum + app.memoryMB, 0)
        .toFixed(2)

    const formatUptime = (minutes) => {
        if (minutes >= 1440) {
            return `${Math.floor(minutes / 1440)} days`
        }

        if (minutes >= 60) {
            return `${Math.floor(minutes / 60)} hours`
        }

        return `${minutes} mins`
    }

    //useEffect
    useEffect(() => {
        fetchApps({ isInitialLoad: true })

        const interval = setInterval(() => {
            fetchApps()
        }, 60000)

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
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Page Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-semibold">Node Applications</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage and monitor PM2 applications running on the server</p>
                        </div>
                        {/* Server Refresh Button */}
                        <div className="flex items-center gap-3">
                            <button
                                disabled={refreshing}
                                onClick={() => fetchApps({ isManualRefresh: true })}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-800 border border-gray-300 rounded-xs text-white text-sm font-medium-500 hover:bg-sky-900 hover:border-sky-500 transition-all active:scale-95 cursor-pointer"
                            >
                                <RotateCw
                                    size={16}
                                    className={refreshing ? "animate-spin" : ""}
                                />

                                {refreshing ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>
                    </div>

                    {/* <-- Stats Overview (Grid) --> */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-4">
                        {/* <!-- Card 1 --> */}
                        <div className="bg-white border border-gray-300 p-5 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium uppercase">Applications</p>
                                    <Grip className="text-sky-800" />
                                </div>
                                <p className="text-black text-xl sm:text-2xl font-bold">{summary.totalApps}</p>
                            </div>
                        </div>

                        {/* <!-- Card 2 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium uppercase">Online</p>
                                    <CircleCheck className="text-sky-800" />
                                </div>
                                <p className="text-black text-xl sm:text-2xl font-bold">{summary.onlineApps}</p>
                            </div>
                        </div>

                        {/* <!-- Card 3 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium uppercase">Stopped</p>
                                    <CircleX className="text-sky-800" />
                                </div>
                                <p className="text-black text-xl sm:text-2xl font-bold">{summary.stoppedApps}</p>
                            </div>
                        </div>

                        {/* <!-- Card 4 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium uppercase">Total Memory Usage</p>
                                    <Cpu className="text-sky-800" />
                                </div>
                                <p className="text-black text-xl sm:text-2xl font-bold">
                                    {totalMemory}
                                    <span className="text-sm ml-1">MB</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Data Table Section --> */}
                    <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
                        {/* Header Section */}
                        <div className="px-4 md:px-6 py-4 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h3 className="font-semibold text-sm text-gray-800 font-semibold">Process List</h3>
                            <div className="flex items-center gap-1 self-end sm:self-auto">
                                <button className="p-1 rounded hover:bg-gray-200 text-gray-600"><Filter className="w-4 h-4" /></button>
                                <button className="p-1 rounded hover:bg-gray-200 text-gray-600"><EllipsisVertical className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Table Wrapper */}
                        <div className="overflow-x-auto">
                            <table className="min-w-[850px] w-full text-center border-collapse text-xs text-gray-700">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-300">
                                        <th className="px-3 py-2 font-semibold uppercase tracking-wider text-left">Application</th>
                                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Status</th>
                                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">CPU (%)</th>
                                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Memory</th>
                                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Restarts</th>
                                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Uptime</th>
                                        <th className="px-3 py-2 font-semibold uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300">
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="text-center py-10 text-gray-500"
                                            >
                                                Loading applications...
                                            </td>
                                        </tr>
                                    ) : (apps.map((app) => (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-left">
                                                <div className="max-w-[180px] truncate font-medium">
                                                    {app.name}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[10px] border ${app.status === "online"
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-red-50 text-red-700 border-red-200"
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${app.status === "online"
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                            }`}
                                                    />
                                                    {app.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 font-mono">
                                                {app.cpuPercent}%
                                            </td>

                                            <td className="px-4 py-3 font-mono">
                                                {app.memoryMB.toFixed(2)} MB
                                            </td>

                                            <td className="px-4 py-3">
                                                {app.restarts}
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatUptime(app.uptimeMinutes)}
                                            </td>

                                            <td className="px-3 py-1.5 md:px-4 md:py-2 text-right">
                                                <Link
                                                    to={`/apps/pm2/${app.name}`}
                                                    className="px-4 py-2 bg-white border border-gray-300 cursor-pointer text-sky-800 rounded text-[11px] font-medium hover:bg-sky-800 hover:text-white transition-all active:scale-95"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    )))}

                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white border-t border-gray-200">
                            <p className="text-gray-500 text-sm">Showing {apps.length} of {summary.totalApps} applications</p>
                            <div className="flex justify-end gap-1">
                                <button className="p-1 rounded disabled:opacity-30 hover:bg-gray-200" >
                                    <ChevronLeft className="text-gray-400" />
                                </button>
                                <button className="p-1 rounded disabled:opacity-30 hover:bg-gray-200">
                                    <ChevronRight className="text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Apps