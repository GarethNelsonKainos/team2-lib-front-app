import express from "express";
import { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import nunjucks from "nunjucks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const appViews = path.join(__dirname, "views");

const app = express();
const port = 3000;

const nunjucksConfig = {
  autoescape: true,
  noCache: true,
  express: app,
};

app.set("view engine", "njk");
app.set("views", appViews);

const nunjucksEnv = nunjucks.configure(
  [appViews, path.join(projectRoot, "node_modules/govuk-frontend/dist")],
  nunjucksConfig,
);
nunjucksEnv.addGlobal("govukRebrand", true);

app.get("/", (req: Request, res: Response) => {
  res.render("test");
});

app.use(
  "/govuk",
  express.static(
    path.join(projectRoot, "node_modules/govuk-frontend/dist/govuk"),
  ),
);

app.use(
  "/assets",
  express.static(
    path.join(projectRoot, "node_modules/govuk-frontend/dist/govuk/assets"),
  ),
);

app.listen(3000, () => {
  console.log(`App listening on port ${port}`);
});
