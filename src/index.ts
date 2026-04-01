import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../dist")));

app.listen(PORT, () => {
  console.log(`Hookbook running at http://localhost:${PORT}`);
});
