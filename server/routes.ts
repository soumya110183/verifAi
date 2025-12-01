import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5001";

async function proxyToPython(req: Request, res: Response, options: {
  method?: string;
  body?: any;
  formData?: FormData;
} = {}) {
  try {
    const url = `${PYTHON_BACKEND_URL}${req.path}`;
    const method = options.method || req.method;
    
    const fetchOptions: RequestInit = {
      method,
      headers: {} as Record<string, string>,
    };
    
    if (options.formData) {
      fetchOptions.body = options.formData;
    } else if (options.body) {
      (fetchOptions.headers as Record<string, string>)["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(options.body);
    } else if (req.body && Object.keys(req.body).length > 0) {
      (fetchOptions.headers as Record<string, string>)["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).json({ error: "Backend service unavailable" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/health", (req, res) => proxyToPython(req, res));
  
  app.get("/api/dashboard", (req, res) => proxyToPython(req, res));
  
  app.get("/api/verifications", (req, res) => proxyToPython(req, res));
  
  app.get("/api/verifications/:id", (req, res) => proxyToPython(req, res));
  
  app.post("/api/verifications", upload.single("document"), async (req, res) => {
    try {
      const url = `${PYTHON_BACKEND_URL}/api/verifications`;
      
      const formData = new FormData();
      if (req.file) {
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("document", blob, req.file.originalname);
      }
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(502).json({ error: "Backend service unavailable" });
    }
  });
  
  app.patch("/api/verifications/:id", (req, res) => proxyToPython(req, res));
  
  app.get("/api/verifications/:id/chat", (req, res) => proxyToPython(req, res));
  
  app.post("/api/verifications/:id/chat", (req, res) => proxyToPython(req, res));
  
  app.get("/api/integrations", (req, res) => proxyToPython(req, res));
  
  app.get("/api/patterns", (req, res) => proxyToPython(req, res));
  
  app.get("/api/settings", (req, res) => proxyToPython(req, res));
  
  app.put("/api/settings", (req, res) => proxyToPython(req, res));
  
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `${PYTHON_BACKEND_URL}/api/audit-logs${queryString ? '?' + queryString : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(502).json({ error: "Backend service unavailable" });
    }
  });
  
  app.get("/api/audit-logs/stats", (req, res) => proxyToPython(req, res));
  
  app.get("/api/audit-logs/export", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `${PYTHON_BACKEND_URL}/api/audit-logs/export${queryString ? '?' + queryString : ''}`;
      const response = await fetch(url);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', response.headers.get('Content-Disposition') || 'attachment; filename="audit_logs.csv"');
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Audit export error:", error);
      res.status(502).json({ error: "Backend service unavailable" });
    }
  });

  return httpServer;
}
