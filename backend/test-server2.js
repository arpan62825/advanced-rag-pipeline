import express from "express";
const app = express();
app.post("/test", async (req, res) => {
  // do nothing
});
const server = app.listen(8001, () => {
  console.log("Listening on 8001");
});
