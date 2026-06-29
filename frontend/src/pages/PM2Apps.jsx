import axios from "axios"
import Sidebar from "../components/Sidebar"
import { endpoint } from "../api"
import { CheckCircle, CircleCheck, CircleX, Cpu, EllipsisVertical, Filter, Minus, Plus, RotateCw, TrendingUp, TriangleAlert, Grip, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"

function Apps() {
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState({
        totalApps: 0,
        onlineApps: 0,
        stoppedApps: 0
    })

    //Get Apps API endpoint
    const fetchApps = async () => {
        try {
            setLoading(true)

            const response = await axios.get(`${endpoint}/metrics/apps`)
            console.log(response.data)
            setApps(response.data.apps)
            setSummary(response.data.summary)

        } catch (error) {
            console.error(error)
            alert("Failed to fetch apps.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApps()
    }, [])

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

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Page Header */}
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Node Applications</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage and monitor PM2 applications running on the server</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xs text-sm font-medium-500 hover:border-primary transition-all active:scale-95">
                                <RotateCw className="" />
                                Refresh
                            </button>
                        </div>
                    </div>
                    {/* <-- Stats Overview (Grid) --> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                        {/* <!-- Card 1 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium uppercase">Applications</p>
                                    <Grip className="text-sky-800" />
                                </div>
                                <p className="text-black text-2xl font-bold">{summary.totalApps}</p>
                            </div>
                        </div>

                        {/* <!-- Card 2 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium uppercase">Online</p>
                                    <CircleCheck className="text-sky-800" />
                                </div>
                                <p className="text-black text-2xl font-bold">{summary.onlineApps}</p>
                            </div>
                        </div>

                        {/* <!-- Card 3 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium uppercase">Stopped</p>
                                    <CircleX className="text-sky-800" />
                                </div>
                                <p className="text-black text-2xl font-bold">{summary.stoppedApps}</p>
                            </div>
                        </div>

                        {/* <!-- Card 4 --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium uppercase">Total Memory Usage</p>
                                    <Cpu className="text-sky-800" />
                                </div>
                                <p className="text-black text-2xl font-bold">
                                    {totalMemory}
                                    <span className="text-sm ml-1">MB</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Data Table Section --> */}
                    <div className="bg-white border border-gray-300 rounded-xs overflow-hidden">
                        {/* Header Section */}
                        <div className="px-6 py-4 border-b bg-white border-gray-300 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-sm text-gray-800 font-semibold">Process List</h3>
                            <div className="flex gap-1">
                                <button className="p-1 rounded hover:bg-gray-200 text-gray-600"><Filter className="w-4 h-4" /></button>
                                <button className="p-1 rounded hover:bg-gray-200 text-gray-600"><EllipsisVertical className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Table Wrapper */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse text-xs text-gray-700">
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
                                            <td className="px-6 py-4 text-left font-medium text-black">
                                                {app.name}
                                            </td>

                                            <td className="px-6 py-4">
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

                                            <td className="px-6 py-4 font-mono">
                                                {app.cpuPercent}%
                                            </td>

                                            <td className="px-6 py-4 font-mono">
                                                {app.memoryMB.toFixed(2)} MB
                                            </td>

                                            <td className="px-6 py-4">
                                                {app.restarts}
                                            </td>

                                            <td className="px-6 py-4">
                                                {formatUptime(app.uptimeMinutes)}
                                            </td>

                                            <td className="px-6 py-4 text-right">
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
                        <div className="px-6 py-4 flex items-center justify-between bg-white border-t border-gray-200">
                            <p className="font-gray-400 text-sm">Showing {apps.length} of {summary.totalApps} applications</p>
                            <div className="flex gap-1">
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