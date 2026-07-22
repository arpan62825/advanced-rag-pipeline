import express from "express";
import responseRoute from "./src/routes/response.route.js";
const app = express();
app.use("/api", responseRoute);
console.log("Routes mounted. Stack:", app._router.stack.filter(r => r.name === 'router')[0].handle.stack.map(r => r.route.path));
