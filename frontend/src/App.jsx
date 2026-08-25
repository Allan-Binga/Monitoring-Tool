import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Apps from "./pages/PM2Apps";
import AppDetails from "./pages/AppDetails";
import Layout from "./components/Layout";
import DockerApps from "./pages/DockerApps";
import Database from "./pages/Database";
import Alerts from "./pages/Alerts";
import Home from "./pages/Home";
import Logs from "./pages/Logs"

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/apps/pm2" element={<Apps />} />
          <Route path="/apps/pm2/:name" element={<AppDetails />} />
          <Route path="/apps/docker" element={<DockerApps />} />
          <Route path="/databases" element={<Database />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/logs" element={<Logs />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App