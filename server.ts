import express from "express";
import { createServer as createViteServer } from "vite";
import { adminAuth, adminDb } from "./lib/firebase-admin";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request logger for debugging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[DEBUG] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example Admin SDK usage: Verify token and get user role
  app.post("/api/admin/verify-role", async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });

    try {
      const decodedToken = await adminAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      const userDoc = await adminDb().collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User profile not found" });
      }

      res.json({ role: userDoc.data()?.role || "basicUser" });
    } catch (error) {
      console.error("Error verifying role:", error);
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  // List all users from Firebase Auth (Admin only)
  app.get("/api/admin/users", async (req, res) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decodedToken = await adminAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      // Check if requester is admin
      const userDoc = await adminDb().collection("users").doc(uid).get();
      if (userDoc.data()?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const listUsersResult = await adminAuth().listUsers(1000);
      res.json({ users: listUsersResult.users });
    } catch (error) {
      console.error("Error listing users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Seed Database Endpoint (Admin only)
  app.post("/api/admin/seed-data", async (req, res) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decodedToken = await adminAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      const userDoc = await adminDb().collection("users").doc(uid).get();
      if (!userDoc.exists || userDoc.data()?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      // Import mock data dynamically
      const { MOCK_ANIMALS, MOCK_APPLICATIONS, MOCK_USERS, MOCK_SHIFTS } = await import("./constants.tsx");

      const batch = adminDb().batch();

      // Seed Animals
      MOCK_ANIMALS.forEach(animal => {
        const { id, ...data } = animal;
        batch.set(adminDb().collection("animals").doc(id), data);
      });

      // Seed Applications
      MOCK_APPLICATIONS.forEach(app => {
        const { id, ...data } = app;
        batch.set(adminDb().collection("applications").doc(id), data);
      });

      // Seed Users
      MOCK_USERS.forEach(user => {
        const { id, ...data } = user;
        batch.set(adminDb().collection("users").doc(id), data);
      });

      // Seed Shifts
      MOCK_SHIFTS.forEach(shift => {
        const { id, ...data } = shift;
        batch.set(adminDb().collection("shifts").doc(id), data);
      });

      await batch.commit();
      res.json({ message: "Database successfully synced with mock data!" });
    } catch (error: any) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: error.message || "Internal server error during seeding" });
    }
  });

  // Update user role and set custom claims (Admin/Staff only)
  app.post("/api/admin/update-role", async (req, res) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    const { targetUid, newRole } = req.body;

    if (!idToken || !targetUid || !newRole) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validRoles = ["admin", "staff", "volunteer", "basicUser"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    try {
      const decodedToken = await adminAuth().verifyIdToken(idToken);
      const requesterUid = decodedToken.uid;
      
      const requesterDoc = await adminDb().collection("users").doc(requesterUid).get();
      const requesterRole = requesterDoc.data()?.role;

      if (requesterRole !== "admin" && requesterRole !== "staff") {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }

      const targetDoc = await adminDb().collection("users").doc(targetUid).get();
      if (!targetDoc.exists) {
        return res.status(404).json({ error: "Target user not found" });
      }

      const targetRole = targetDoc.data()?.role;

      // Staff cannot edit other staff or admins
      if (requesterRole === "staff") {
        if (targetRole === "staff" || targetRole === "admin") {
          return res.status(403).json({ error: "Forbidden: Staff cannot modify other staff or admins" });
        }
        // Staff can only promote to volunteer or basicUser
        if (newRole === "admin" || newRole === "staff") {
          return res.status(403).json({ error: "Forbidden: Staff cannot promote users to staff or admin" });
        }
      }

      // Update Firestore
      await adminDb().collection("users").doc(targetUid).update({ role: newRole });

      // Set Custom Claims
      await adminAuth().setCustomUserClaims(targetUid, { role: newRole });

      res.json({ message: `User role updated to ${newRole} and custom claims set.` });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
