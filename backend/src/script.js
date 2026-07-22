import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import responseRoute from "./routes/response.route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", responseRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
