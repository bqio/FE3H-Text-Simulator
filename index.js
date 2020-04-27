const express = require("express");
const app = express();

app.get("/fe3h-text-simulator", (req, res) => {
  res.sendFile(__dirname + "/public/fe3h-text-simulator/index.html");
});

app.use(express.static("files"));
app.use("/fe3h-text-simulator", express.static("public/fe3h-text-simulator"));

app.listen(80, () => console.log("Server started."));
