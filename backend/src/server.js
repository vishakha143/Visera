const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const env = require("./config/env");
const {connectDB} = require("./config/db");
const {notFound , errorHandler} = require("./middleware/errorHandler");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const resumeRouter = require("./routes/resumes");
const dashboardRouter = require("./routes/dashboard");
const insightsRouter = require("./routes/insights");
const versionRouter = require("./routes/versions");
const historyRouter = require("./routes/history");
const jobMatchesRouter = require("./routes/jobMatches");
const applicationsRouter = require("./routes/applications");
const jobsRouter = require("./routes/jobs");

const app = express();

app.set("trust proxy" , 1);
app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin / server tools with no Origin header
      if (!origin) return cb(null, true);
      if (env.clientOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({limit: "1mb"}));
app.use(express.urlencoded({extended : true, limit : "1mb"}));
app.use(cookieParser());
if(!env.isProd) app.use(morgan("dev"));

app.use("/api/health" , healthRouter);
app.use("/api/auth",authRouter);
app.use("/api/resumes" , resumeRouter);
app.use("/api/dashboard",dashboardRouter);
app.use("/api/insights",insightsRouter);
app.use("/api/versions", versionRouter);
app.use("/api/history", historyRouter);
app.use("/api/job-matches", jobMatchesRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/jobs", jobsRouter);

app.use(notFound);
app.use(errorHandler);

async function start(){
    try{
        await connectDB();
        app.listen(env.port, () => {
            console.log(`server listening on http://localhost:${env.port} (${env.nodeEnv})`);
        });
    }catch(err){
        console.error("Failed to start server:" , err.message);
        process.exit(1);
    }
}

process.on("unhandledRejection" , (reason) => {
    console.error("unhandledRejection:" , reason);
});

start();

module.exports = app;