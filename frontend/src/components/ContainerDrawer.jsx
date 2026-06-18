import { ArrowDown, ArrowRight, Cpu, Server, RotateCw, Square, X, ArrowUp, EthernetPort, Search, Play } from "lucide-react"
import axios from "axios"
import { useEffect, useState, useRef } from "react"
import { endpoint } from "../api"
import { startContainer, stopContainer, restartContainer } from "../api/docker"

function ContainerDrawer({ isOpen, onClose, containerId, onContainerChanged }) {
    const [dockerContainer, setDockerContainer] = useState(null)
    const [containerLogs, setContainerLogs] = useState(null)
    const [metrics, setMetrics] = useState(null)
    const [activeTab, setActiveTab] = useState("overview")
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const logsRef = useRef(null)

    //Setting Default Tab
    useEffect(() => {
        setActiveTab("overview")
    }, [containerId])

    //Container Details Fetch API and useEffect
    const fetchContainer = async () => {
        if (!containerId) return

        try {
            setLoading(true)
            const response = await axios.get(
                `${endpoint}/docker/container/${containerId}`
            )
            setDockerContainer(response.data.container)
            setMetrics(response.data.metrics)
            console.log(response.data)
        } catch (error) {
            console.error("Error fetching container details:", error)
        } finally {
            setLoading(false)
        }
    }

    //useEffect
    useEffect(() => {
        if (isOpen) {
            fetchContainer()
        }
    }, [containerId, isOpen])

    // Container Logs Fetch
    const fetchLogs = async () => {
        if (!containerId) return

        try {
            const response = await axios.get(
                `${endpoint}/docker/container/${containerId}/logs`
            )
            setContainerLogs(response.data.logs)
        } catch (error) {
            console.error(error)
        }
    }

    //useEffect
    useEffect(() => {
        if (!isOpen || activeTab !== "logs")
            return

        fetchLogs()

        const interval = setInterval(fetchLogs, 5000)

        return () => clearInterval(interval)
    }, [containerId, activeTab, isOpen])

    //Container Logs Cleanup
    const cleanedLogs = containerLogs
        ?.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
        ?.split("\n")
        ?.filter(Boolean)

    //Log Coloring
    const getLogColor = (line) => {
        if (line.includes("level=error"))
            return "text-red-400"

        if (line.includes("level=warn"))
            return "text-yellow-400"

        if (line.includes("level=info"))
            return "text-blue-400"

        return "text-slate-300"
    }

    //log coloring and useEffect
    useEffect(() => {
        logsRef.current?.scrollTo({
            top: logsRef.current.scrollHeight,
            behavior: "smooth"
        })
    }, [containerLogs])

    //Container State Styles
    const getStatusStyles = (state) => {
        switch (state) {
            case "running":
                return "bg-green-50 text-green-700"

            case "exited":
                return "bg-red-50 text-red-700"

            case "created":
                return "bg-amber-50 text-amber-700"

            default:
                return "bg-gray-50 text-gray-700"
        }
    }

    // Reusable Tab Button Style
    const tabButtonClass = (tab) =>
        `px-4 py-3 border-b-2 text-sm transition-all duration-200 ease-in-out ${activeTab === tab
            ? "border-sky-700 text-sky-700 font-semibold"
            : "border-transparent text-gray-500 cursor-pointer hover:text-black hover:bg-gray-100"
        }`


    //Start Container
    const handleStart = async () => {
        try {
            setActionLoading(true)
            await startContainer(containerId)
            fetchContainer()
            onContainerChanged()
        } catch (error) {
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    //Stop Container
    const handleStop = async () => {
        try {
            setActionLoading(true)
            await stopContainer(containerId)
            fetchContainer()
            onContainerChanged()
        } catch (error) {
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    //Docker Action Buttons Hellper
    const isRunning = dockerContainer?.state === "running"

    return (
        <div
            className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            onClick={onClose}
        >
            <aside
                onClick={(e) => e.stopPropagation()}
                className={`
                    fixed right-0 top-0 h-screen
                    w-full md:w-1/2 lg:w-1/3
                    bg-white shadow-2xl
                    border-l border-gray-300
                    flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >

                {/* Drawer Header */}
                <div className="p-6 border-b border-gray-300 flex items-center justify-between bg-gray-200">
                    <div className="flex flex-col">
                        {/* Container Name  & ID*/}
                        <h3 className="font-bold text-lg">{dockerContainer?.name}</h3>
                        <span className="font-mono-md text-sm text-gray-500">ID: {dockerContainer?.id?.slice(0, 12)}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600 cursor-pointer hover:text-gray-800">
                        <X />
                    </button>
                </div>

                {/* Drawer Tabs */}
                <div className="flex border-b border-gray-300 px-6 bg-white">
                    <button className={tabButtonClass("overview")} onClick={() => setActiveTab("overview")}>Overview</button>
                    <button className={tabButtonClass("metrics")} onClick={() => setActiveTab("metrics")}>Metrics</button>
                    <button className={tabButtonClass("logs")} onClick={() => setActiveTab("logs")}>Logs</button>
                    <button className={tabButtonClass("networking")} onClick={() => setActiveTab("networking")}>Networking</button>
                </div>

                {/* Drawer Content Container */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        /* Skeleton loader stays isolated completely inside the scroll element */
                        <div className="animate-pulse space-y-4">
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                    ) : (
                        <>
                            {/* 1. OverView Tab */}
                            {activeTab == "overview" && (
                                <div className="p-6 space-y-6">
                                    <section>
                                        <h4 className="font-semibold text-gray-600 uppercase tracking-narrow mb-3">Configuration</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="font-normal text-md text-gray-700">Image</p>
                                                <p className="font-semibold text-sm text-black">{dockerContainer?.image}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-normal text-md text-gray-700">State</p>
                                                <span className={`inline-flex items-center gap-2 font-semibold text-sm px-2.5 py-1 rounded-full ${getStatusStyles(dockerContainer?.state)}`}>
                                                    {/* The dot now scales correctly and automatically steals the text color rule */}
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block"></span>

                                                    {dockerContainer?.state
                                                        ? dockerContainer.state.charAt(0).toUpperCase() + dockerContainer.state.slice(1)
                                                        : "-"}
                                                </span>

                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-normal text-md text-gray-700">Started At</p>
                                                <p className="font-semibold text-sm text-black">{dockerContainer?.startedAt
                                                    ? new Date(dockerContainer.startedAt).toLocaleString()
                                                    : "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-normal text-md text-gray-700">Uptime</p>
                                                <p className="font-semibold text-sm text-black"> {dockerContainer?.uptime}</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Port Mappings */}
                                    <section>
                                        <h4 className="font-semibold text-gray-600 uppercase tracking-narrow mb-3 mt-8">Port Mappings</h4>
                                        <div className="bg-gray-200 rounded-md p-3 space-y-2">
                                            {dockerContainer?.ports?.length ? (
                                                dockerContainer?.ports.map((port, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span className="text-sm">
                                                            {port.containerPort}/{port.protocol}
                                                        </span>

                                                        <ArrowRight size={16} />

                                                        <span className="text-sm">
                                                            {port.hostPort}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    No published ports
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Environment Variables */}
                                    <section>
                                        <h4 className="font-semibold text-gray-600 uppercase tracking-narrow mb-3 mt-8">Environment</h4>
                                        <div className="space-y-2">
                                            {dockerContainer?.env?.map((variable, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col gap-1"
                                                >
                                                    <span className="text-gray-700">
                                                        {variable.key}
                                                    </span>

                                                    <code className="bg-gray-200 px-2 py-1 rounded text-sm break-all">
                                                        {variable.value}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* 2. Metrics Tab */}
                            {activeTab == "metrics" && (
                                <div className=" p-6 space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* <!-- CPU Metric --> */}
                                        <div className="bg-white border border-gray-400 rounded-md p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-600 uppercase tracking-wider">CPU Usage</p>
                                                    <p className="font-bold text-xl text-black">{metrics?.cpuPercent ?? 0}%</p>
                                                </div>
                                                <Cpu className="text-sky-700" />
                                            </div>
                                            <div className="h-16 flex items-end gap-1 overflow-hidden">
                                                <div className="flex-1 bg-sky-500/20 h-1/4 rounded-sm"></div>
                                                <div className="flex-1 bg-sky-500/20 h-2/4 rounded-sm"></div>
                                                <div className="flex-1 bg-sky-500/20 h-1/4 rounded-sm"></div>
                                                <div className="flex-1 bg-sky-900/20 h-3/4 rounded-sm"></div>
                                                <div className="flex-1 bg-sky-700 h-2/4 rounded-sm"></div>
                                                <div className="flex-1 bg-sky-500/20 h-1/4 rounded-sm"></div>
                                                <div className="flex-1 bg-sky-600 h-2/5 rounded-sm"></div>
                                                <div className="flex-1 bg-sky-900 h-3/4 rounded-sm animate-pulse"></div>
                                            </div>
                                        </div>
                                        {/* <!-- Memory Metric --> */}
                                        <div className="bg-white border border-gray-400 rounded-md p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-600 uppercase tracking-wider">Memory</p>
                                                    <p className="font-bold text-xl text-black">
                                                        {metrics?.memory?.usageMB ?? 0} MB /
                                                        {metrics?.memory?.limitMB ?? 0} MB
                                                    </p>
                                                </div>
                                                <Server className="text-sky-700 text-bold" />
                                            </div>
                                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                <div className="bg-sky-800 h-full w-1/2" style={{
                                                    width: `${metrics?.memory?.percentage ?? 0}%`
                                                }}></div>
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <span className="font-semibold text-sm text-gray-600">Usage: {metrics?.memory?.percentage} %</span>
                                                <span className="font-semibold text-sm text-gray-600">Limit: {metrics?.memory?.limitMB} MB</span>
                                            </div>
                                        </div>
                                        {/* <!-- Network I/O --> */}
                                        <div className="bg-white border border-gray-400 rounded-md p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-600 uppercase tracking-wider">Network I/O</p>
                                                    <div className="flex gap-4">
                                                        <span className="font-semibold text-sm text-green-600 flex items-center gap-1">
                                                            <ArrowDown className="text-sm" /> {metrics?.networkIO?.rxBytes ?? 0} Bytes
                                                        </span>
                                                        <span className="font-bold text-sm text-sky-800 flex items-center gap-1">
                                                            <ArrowUp className="text-sm" /> {metrics?.networkIO?.txBytes ?? 0} Bytes
                                                        </span>
                                                    </div>
                                                </div>
                                                <EthernetPort className="text-sky-800" />
                                            </div>
                                            {/* <div className="h-16 relative">
                                                <svg className="w-full h-full" viewbox="0 0 100 40">
                                                    <path className="text-sky-800/30" d="M0,35 L10,30 L20,32 L30,25 L40,28 L50,15 L60,20 L70,10 L80,12 L90,5 L100,8" ></path>
                                                    <path className="text-sky-700" d="M0,35 L10,30 L20,32 L30,25 L40,28 L50,15 L60,20 L70,10 L80,12 L90,5 L100,8" ></path>
                                                </svg>
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Logs Tab */}
                            {activeTab == "logs" && (
                                <div className=" p-6 space-y-6">
                                    <div className="flex flex-col h-full rounded-md overflow-hidden border border-gray-400 bg-slate-950">
                                        {/* <!-- Terminal Header --> */}
                                        <div className="px-4 py-2 bg-slate-900 border-b border-white/10 flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                                            </div>
                                            <div className="relative">
                                                <Search className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-white/40" size={12} />
                                                <input className="bg-white/5 border-none rounded py-0.5 pl-7 pr-2 text-[11px] text-white/80 focus:ring-1 focus:ring-primary/40 w-32" placeholder="Search logs..." type="text" />
                                            </div>
                                        </div>

                                        {/* <!-- Terminal Content --> */}
                                        <div
                                            ref={logsRef}
                                            className="p-4 flex-1 font-mono text-[12px] text-slate-300 overflow-y-auto space-y-1">
                                            {cleanedLogs?.map((log, index) => (
                                                <p
                                                    key={index}
                                                    className={`break-all ${getLogColor(log)}`}
                                                >
                                                    {log}
                                                </p>
                                            ))}

                                            <p className="animate-pulse text-green-400">█</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. Networking Tab */}
                            {activeTab === "networking" && (
                                <div className="p-6 space-y-6">
                                    <section>
                                        <h4 className="font-semibold text-gray-600 uppercase tracking-narrow mb-3">Interface Details</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-400/30">
                                                <span className="font-normal text-sm text-gray-600">Network Mode</span>
                                                <span className="font-medium text-sm bg-gray-300 px-2 py-0.5 rounded lowercase first-letter:uppercase">
                                                    {dockerContainer?.network?.mode || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-400/30">
                                                <span className="font-normal text-sm text-gray-600">IP Address</span>
                                                <span className="font-normal text-sm text-black">{dockerContainer?.network?.ipAddress || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-400/30">
                                                <span className="font-normal text-sm text-gray-600">Gateway</span>
                                                <span className="font-normal text-sm text-black">{dockerContainer?.network?.gateway || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-400/30">
                                                <span className="font-normal text-sm text-gray-600">MAC Address</span>
                                                <span className="font-normal text-sm text-black">{dockerContainer?.network?.macAddress || "N/A"}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="font-semibold text-gray-600 uppercase tracking-narrow mb-3 mt-8">Published Ports</h4>
                                        <div className="bg-gray-100 rounded-sm overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-300">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium text-gray-500">Host Port</th>
                                                        <th className="px-4 py-2 font-medium text-gray-500">Container Port</th>
                                                        <th className="px-4 py-2 font-medium text-gray-500">Protocol</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-600/30">
                                                    {dockerContainer?.ports && dockerContainer.ports.length > 0 ? (
                                                        // Filter out IPv6 duplicates to keep the UI clean
                                                        dockerContainer.ports
                                                            .filter((port) => port.hostIp !== "::")
                                                            .map((port, index) => {
                                                                // Split "8080/tcp" into port number and protocol components
                                                                const [cPort, protocol] = (port.containerPort || "").split("/")

                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="px-4 py-3 font-mono-md text-black">
                                                                            {port.hostPort || "N/A"}
                                                                        </td>
                                                                        <td className="px-4 py-3 font-mono-md text-black">
                                                                            {cPort || "N/A"}
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                                                                {protocol || "tcp"}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" className="px-4 py-4 text-center text-gray-500 italic">
                                                                No ports published
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </>
                    )}

                </div>

                {/* Drawer Actions */}
                <div className="p-6 border-t border-gray-300 bg-gray-200 flex gap-3">

                    {isRunning ? (
                        <>
                            <button
                                onClick={handleStop}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-400 rounded-xs font-normal text-red-700 cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Square size={16} />
                                {actionLoading ? "Stopping..." : "Stop"}
                            </button>

                            <button
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-400 rounded-xs font-semibold text-black cursor-pointer hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCw size={16} />
                                Restart
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleStart}
                            disabled={actionLoading}
                            className="
                                flex-1 flex items-center justify-center gap-2 cursor-pointer
                                px-4 py-2
                                border border-gray-400
                                rounded-xs
                                font-semibold
                                text-green-700
                                hover:bg-green-50
                                transition-colors
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            <Play size={16} />

                            {actionLoading ? "Starting..." : "Start"}
                        </button>
                    )}

                </div>
            </aside>
        </div>
    )
}

export default ContainerDrawer