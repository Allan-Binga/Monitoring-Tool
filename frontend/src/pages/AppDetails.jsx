import Sidebar from "../components/Sidebar"
import { endpoint } from "../api"
import axios from "axios"
import { RotateCw, Square, Play, Cpu, RefreshCw, Timer, Info, Copy, Search, Download, Activity, CheckCircle2, AlertTriangle, CircleAlert } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { startApp, stopApp, restartApp } from "../api/pm2"

function AppDetails() {
    const { name } = useParams()
    const navigate = useNavigate()
    const [app, setApp] = useState(null)
    const [logs, setLogs] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedAction, setSelectedAction] = useState(null)
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [summary, setSummary] = useState({
        cpu: 0,
        memoryUsage: 0,
        resarts: 0,
        uptime: 0
    })

    //Fetch App Details API
    const fetchApp = async () => {
        try {
            const response = await axios.get(
                `${endpoint}/pm2/apps/${name}/details`
            )

            const appData = response.data.app
            // console.log(appData)

            setApp({
                name: appData.name,
                pid: appData.pid,
                status: appData.pm2_env.status,
                nodeVersion: appData.pm2_env.node_version,
                execMode: appData.pm2_env.exec_mode,
                cwd: appData.pm2_env.pm_cwd,
                cpu: Number(appData.monit.cpu ?? 0),
                memoryMB: (
                    appData.monit.memory /
                    1024 /
                    1024
                ).toFixed(2),
                restarts: appData.pm2_env.restart_time,
                uptime: appData.pm2_env.pm_uptime
            })

            setLogs([
                ...(response.data.logs.stdout || []),
                ...(response.data.logs.stderr || [])
            ].filter(Boolean))
        } catch (error) {
            console.error(error)
            alert("Error fetching app.")
        }
    }

    //App Details useEffect and 5 s poll
    useEffect(() => {
        fetchApp()

        //5 sec poll
        const interval = setInterval(fetchApp, 5000)

        return () => clearInterval(interval)
    }, [name])

    // Loading State
    if (!app) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-600 text-lg">Loading app...</p>
            </div>
        )
    }

    //Time Formatter
    const formatUptime = (uptime) => {
        if (!uptime) return "-"

        const diff = Date.now() - uptime

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)

        if (days > 0) return `${days}d ${hours}h`
        if (hours > 0) return `${hours}h ${minutes}m`

        return `${minutes}m`
    }
    //Log Filtering by Search
    const filteredLogs = logs.filter(log =>
        log.toLowerCase().includes(searchTerm.toLowerCase())
    )

    //PM2 Applications Actions
    const handleAppAction = async () => {
        if (!app)
            return

        try {
            setActionLoading(true)

            switch (selectedAction) {
                case "start":
                    await startApp(app.name)
                    break
                case "stop":
                    await stopApp(app.name)
                    break

                case "restart":
                    await restartApp(app.name)
                    break

                default:
                    break
            }

            setConfirmModalOpen(false)

            await fetchApp()
            //Polling
            setTimeout(fetchApp, 1000)
            setTimeout(fetchApp, 3000)
        } catch (error) {
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    const isRunning = app.status === "online"

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Page Header */}
                    <div className="flex justify-between items-end mb-4">
                        <div className="flex flex-col gap-1">
                            {/* Row wrapper to keep the title and online tag side-by-side */}
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-semibold">{app.name}</h2>
                                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                    Online
                                </span>
                            </div>

                            <p className="text-sm text-gray-600">PM2 Application Details</p>
                        </div>
                        <div className="flex items-center gap-3">

                            {/* Restart */}
                            <button
                                onClick={() => {
                                    setSelectedAction("restart")
                                    setConfirmModalOpen(true)
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xs text-sm text-gray-800 font-normal hover:border-sky-400 hover:bg-sky-50 transition-all active:scale-95 cursor-pointer"
                            >
                                <RotateCw size={14} />
                                Restart
                            </button>

                            {/* Stop - only show if running */}
                            {app.status === "online" && (
                                <button
                                    onClick={() => {
                                        setSelectedAction("stop")
                                        setConfirmModalOpen(true)
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xs text-sm text-red-500 font-normal hover:border-red-300 hover:bg-red-800 hover:text-white transition-all active:scale-95 cursor-pointer"
                                >
                                    <Square size={14} />
                                    Stop
                                </button>
                            )}

                            {/* Start - only show if stopped */}
                            {app.status !== "online" && (
                                <button
                                    onClick={() => {
                                        setSelectedAction("start")
                                        setConfirmModalOpen(true)
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-800 border border-sky-700 rounded-xs text-sm text-white font-normal hover:border-sky-600 hover:bg-sky-700 transition-all active:scale-95 cursor-pointer"
                                >
                                    <Play size={14} />
                                    Start
                                </button>
                            )}

                        </div>
                    </div>

                    {/* <!-- Quick Stats --> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                        {/* <!-- Card 1: CPU Usage --> */}
                        <div className="bg-white border border-gray-300 px-3 py-4 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium uppercase">CPU Usage</p>
                                    <div className="w-12 h-6 flex items-end justify-between px-0.5 bg-sky-50">
                                        <div className="w-1 bg-sky-200 h-2 rounded-t-xs"></div>
                                        <div className="w-1 bg-sky-200 h-4 rounded-t-xs"></div>
                                        <div className="w-1 bg-sky-200 h-3 rounded-t-xs"></div>
                                        <div className="w-1 bg-sky-500 h-5 rounded-t-xs"></div>
                                    </div>
                                </div>
                                <p className="text-black text-3xl font-bold">
                                    {app.cpu > 0 ? app.cpu.toFixed(1) : "< 0.1"}
                                    <span className="text-lg font-medium ml-0.5">%</span>
                                </p>
                            </div>
                        </div>

                        {/* <!-- Card 2: Memory Usage --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium uppercase">Memory Usage</p>
                                    <Cpu className="text-gray-500" />
                                </div>
                                <p className="text-black text-3xl font-bold">
                                    {app.memoryMB}
                                    <span className="text-lg font-medium ml-0.5">MB</span>
                                </p>
                            </div>
                        </div>

                        {/* <!-- Card 3: Restarts --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium uppercase">Restarts</p>
                                </div>
                                <p className="text-black text-3xl font-bold">
                                    {app.restarts}
                                </p>
                            </div>
                        </div>

                        {/* <!-- Card 4: Uptime --> */}
                        <div className="bg-white border border-gray-300 px-3 py-6 rounded-xs transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-600 text-sm font-medium uppercase">Uptime</p>
                                    <Timer className="text-green-500" />
                                </div>
                                <p className="text-black text-3xl font-bold">
                                    {formatUptime(app.uptime)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Information Card */}
                        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-sm overflow-hidden h-fit">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h4 className=" text-sm font-semibold">
                                    Information
                                </h4>

                                <Info size={18} className="text-gray-500" />
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-sm text-gray-600">Name</span>
                                    <span className="font-mono text-sm font-medium">
                                        {app.name}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-sm text-gray-600">PID</span>

                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">
                                        {app.pid}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-sm text-gray-600">Status</span>

                                    <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                                        {app.status}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-sm text-gray-600">Node Version</span>

                                    <span className="font-mono text-sm">
                                        {app.nodeVersion}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-sm text-gray-600">Execution Mode</span>

                                    <span className="font-mono text-sm">
                                        {app.execMode}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-sm text-gray-600">
                                        Working Directory
                                    </span>
                                </div>

                                <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center justify-between">
                                    <span className="font-mono text-sm text-gray-600 truncate">
                                        {app.cwd}
                                    </span>

                                    <Copy
                                        size={16}
                                        onClick={() => navigator.clipboard.writeText(app.cwd)}
                                        className="text-slate-400 cursor-pointer hover:text-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logs Card */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col">

                            {/* Header */}
                            <div className="px-6 py-2 border-b border-slate-100 flex items-center justify-between">

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">
                                            Recent Logs
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">

                                    <div className="relative">
                                        <Search
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Filter logs..."
                                            className="
                                                w-56
                                                rounded-sm
                                                border
                                                border-slate-200
                                                bg-slate-50
                                                py-2
                                                pl-9
                                                pr-3
                                                text-sm
                                                focus:border-sky-400
                                                focus:outline-none
                                            "
                                        />
                                    </div>

                                    <button className="rounded-sm border border-slate-200 p-2 hover:bg-slate-50 transition-colors">
                                        <Download size={16} />
                                    </button>

                                    <button className="rounded-sm border border-slate-200 p-2 hover:bg-slate-50 transition-colors">
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Terminal */}
                            <div className="bg-slate-950 h-[520px] overflow-y-auto font-mono text-sm">

                                <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>

                                    <span className="ml-3 text-slate-500 text-xs">
                                        pm2 logs {app.name}
                                    </span>
                                </div>

                                <div className="p-4 space-y-2 text-slate-300">
                                    {filteredLogs.length > 0 ? (
                                        filteredLogs.map((log, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3"
                                            >
                                                <span className="text-slate-500 shrink-0">
                                                    #{index + 1}
                                                </span>

                                                <span
                                                    className={
                                                        log.toLowerCase().includes("error")
                                                            ? "text-red-400"
                                                            : log.toLowerCase().includes("warn")
                                                                ? "text-amber-400"
                                                                : "text-green-400"
                                                    }
                                                >
                                                    {log.toLowerCase().includes("error")
                                                        ? "ERROR"
                                                        : log.toLowerCase().includes("warn")
                                                            ? "WARN"
                                                            : "INFO"}
                                                </span>

                                                <span>{log}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-500">
                                            No logs found.
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Footer */}
                            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">

                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    Tail Mode Active
                                </div>

                                <span className="text-sm text-slate-500">
                                    Updated 3 seconds ago
                                </span>

                            </div>

                        </div>
                    </div>
                </div>
            </main>
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md bg-white rounded-md shadow-xl">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="font-semibold text-lg">
                                Confirm Action
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-gray-700">
                                Are you sure you want to{" "}
                                <span className="font-semibold">
                                    {selectedAction}
                                </span>{" "}
                                app{" "}
                                <span className="font-semibold">
                                    {app?.name}
                                </span>
                                ?
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">

                            <button
                                onClick={() =>
                                    setConfirmModalOpen(false)
                                }
                                disabled={actionLoading}
                                className="px-4 py-2 border border-gray-300 rounded-xs cursor-pointer hover:bg-gray-50 text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAppAction}
                                disabled={actionLoading}
                                className={`
                                    px-4 py-2 rounded-xs text-white
                                    ${selectedAction === "stop"
                                        ? "bg-red-600 hover:bg-red-700 text-sm cursor-pointer"
                                        : selectedAction === "restart"
                                            ? "bg-amber-600 hover:bg-amber-700 text-sm rounded-xs cursor-pointer"
                                            : "bg-sky-700 hover:bg-sky-800 text-sm rounded-xs cursor-pointer"
                                    }
                                `}
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : `Confirm ${selectedAction}`}
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}

export default AppDetails