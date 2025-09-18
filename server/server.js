
const express = require("express")
const app = express();
const cors = require("cors")
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/api/test", (req,res) => {
    res.json({message: "Hello from the backend."})
});

app.get("/", (req,res) => {
    res.send("Server is running !");
})

app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`)
});