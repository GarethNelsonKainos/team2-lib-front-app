import express from "express";
import 'dotenv/config';
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

app.get("/books", async (req: Request, res: Response) => {
  try {
    // Replace with your actual backend API URL
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const apiUrl = `${backendUrl}/books`;
    const booksEndpoint = process.env.BACKEND_BOOKS_ENDPOINT || '/books';
    const normalizedBooksEndpoint = booksEndpoint.startsWith('/') ? booksEndpoint : `/${booksEndpoint}`;
    const apiURL = `${backendUrl}${normalizedBooksEndpoint}`;
    
    console.log(`Attempting to fetch from: ${apiUrl}`);
    
    // Fetch books from your backend API
    const response = await fetch(apiUrl);
    
    console.log(`Backend response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const books = await response.json();
    
    // Transform the data to match the GOV.UK table format
    const tableRows = books.map((book: any) => [
      { text: book.title },
      { text: book.author },
      { text: book.isbn },
      { text: book.publication_year?.toString() || '' },
      { text: book.genre },
      { text: book.availability || book.status }
    ]);
    
    // Pass the data to the template
    res.render("allBooks", { tableRows });
    
  } catch (error) {
    console.error('Error fetching books:', error);
    // Render with empty data or error message
    res.render("allBooks", { 
      tableRows: [],
      error: 'Unable to fetch books from the backend'
    });
  }
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
