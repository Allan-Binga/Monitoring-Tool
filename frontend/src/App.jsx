import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Apps from "./pages/PM2Apps";
import AppDetails from "./pages/AppDetails";
import Layout from "./components/Layout";
import DockerApps from "./pages/DockerApps";
import Home from "./pages/Home";

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
        </Route>

      </Routes>
    </Router>
  )
}

export default App