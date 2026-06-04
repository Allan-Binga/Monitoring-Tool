const express = require("express")
const cors = require("cors")
const metricsRoute = require("./routes/metrics")

const app = express();

app.use(express.json())

//Cors
const allowedOrigins = [
  "http://localhost:5173"

];

const corsOptions = {
  origin: function (origin, callback) {
    // console.log("Incoming Origin:", origin);
    // console.log("Method:", this?.req?.method);
    // console.log("URL:", this?.req?.url);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Rejected Origin:", origin);
      callback(new Error("Not allowed by CORS!"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions))

//Routes
app.use("/system-monitor/v1/metrics", metricsRoute)

// Start the server
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}