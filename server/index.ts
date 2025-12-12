import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { spawn, type ChildProcess } from "child_process";
import path from "path";
import session from "express-session";

const app = express();
const httpServer = createServer(app);

let pythonProcess: ChildProcess | null = null;

declare module "express-session" {
  interface SessionData {
    isAuthenticated?: boolean;
    user?: { username: string };
  }
}

async function waitForPythonBackend(maxAttempts = 30): Promise<boolean> {
  const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5001";
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/health`);
      if (response.ok) {
        console.log("[python] Backend is ready!");
        return true;
      }
    } catch (e) {
      // Backend not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.error("[python] Backend failed to start within timeout");
  return false;
}

function startPythonBackend() {
  const pythonPath = path.join(process.cwd(), "python_backend", "app.py");
  
  console.log(`[python] Starting Python backend from: ${pythonPath}`);
  
 pythonProcess = spawn("py", [pythonPath], {

    env: { ...process.env, FLASK_PORT: "5001" },
    stdio: ["pipe", "pipe", "pipe"],
    cwd: process.cwd(),
  });

  pythonProcess.stdout?.on("data", (data) => {
    console.log(`[python] ${data.toString().trim()}`);
  });

  pythonProcess.stderr?.on("data", (data) => {
    console.log(`[python] ${data.toString().trim()}`);
  });

  pythonProcess.on("error", (err) => {
    console.error(`[python] Failed to start Python backend: ${err.message}`);
  });

  pythonProcess.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.log(`[python] Backend exited with code ${code}, restarting...`);
      setTimeout(startPythonBackend, 2000);
    }
  });

  console.log("[python] Starting Python backend on port 5001...");
}

process.on("SIGTERM", () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  process.exit(0);
});

process.on("SIGINT", () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  process.exit(0);
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "verifai-demo-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  startPythonBackend();
  
  // Wait for Python backend to be ready in production
  if (process.env.NODE_ENV === "production") {
    console.log("[python] Waiting for backend to be ready...");
    await waitForPythonBackend(30);
  } else {
    // In development, give it a few seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
     host: "127.0.0.1",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
