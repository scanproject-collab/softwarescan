import express, { Request, Response, NextFunction, Router } from "express";
import { authRoutes, operatorRoutes, postRoutes, tagRoutes, managerRoutes, institutionRoutes, adminRoutes, polygonsRoutes } from "../src/routes/index";
import { sendOneSignalNotification } from '../src/services/oneSignalNotification';
import dotenv from "dotenv";
import cors from "cors";
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get the Scalar JSON spec
const scalarJsonPath = path.join(__dirname, '../scalar.json');
const scalarJson = JSON.parse(fs.readFileSync(scalarJsonPath, 'utf8'));

// Serve static API docs if they exist
const apiDocsPath = path.join(__dirname, '../api-docs');
if (fs.existsSync(apiDocsPath)) {
  app.use('/api-docs', express.static(apiDocsPath));
  console.log('API documentation is available at /api-docs');
}

// Root Routes
app.use("/auth", authRoutes);
app.use("/operators", operatorRoutes);
app.use("/admin", adminRoutes);
app.use("/managers", managerRoutes);
app.use("/institutions", institutionRoutes);
app.use("/posts", postRoutes);
app.use("/tags", tagRoutes);
app.use("/polygons", polygonsRoutes);

// Create a router for the api routes
const apiRouter = express.Router();

// API routes
apiRouter.get("/", (_req: Request, res: Response) => {
  res.send("API is working!");
});

apiRouter.get("/api-reference", (_req: Request, res: Response) => {
  if (fs.existsSync(apiDocsPath)) {
    res.redirect('/api-docs');
  } else {
    res.send('API documentation not generated yet. Run "pnpm run docs" to generate it.');
  }
});

apiRouter.get("/google-maps-api-url", (_req: Request, res: Response): void => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ message: "Google Maps API key not configured" });
    return;
  }
  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,visualization`;
  res.json({ url });
});

apiRouter.post("/send-notification", async (req: Request, res: Response): Promise<void> => {
  const { playerId, title, body, data } = req.body;
  if (!playerId || !title || !body) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  console.log('Sending notification to playerId:', playerId);
  try {
    await sendOneSignalNotification(playerId, title, body, data);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

apiRouter.get("/ping", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

// Register all API routes
app.use('/', apiRouter);

// 404 handler - this must come after all defined routes
app.use((_req: Request, res: Response) => {
  res.status(404).send("Not found");
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error occurred:", err);
  res.status(500).send("Internal Server Error");
});

// Start the server
app.listen(3000, function (err) {
  if (err) console.log("Error in server setup")
  console.log("Server listening on Port");
})

export default app;