import express from "express";
import path from "path";

const app = express();
const port = 4000;

app.use(express.static(path.join(process.cwd(), "bundle")));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
