import express from "express";
import { createServer as createViteServer } from "vite";
import { adminAuth, adminDb } from "./lib/firebase-admin.ts";
import Stripe from "stripe";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Stripe Webhook needs raw body - MUST be before express.json()
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error("Missing stripe-signature or STRIPE_WEBHOOK_SECRET");
      return res.status(400).send("Webhook Error: Missing signature or secret");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Record the donation in Firestore
      try {
        await adminDb().collection("donations").add({
          stripeSessionId: session.id,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
          customerEmail: session.customer_details?.email,
          customerName: session.customer_details?.name,
          status: "completed",
          createdAt: new Date().toISOString(),
          metadata: session.metadata
        });
        console.log(`Donation recorded for session ${session.id}`);
      } catch (error) {
        console.error("Error recording donation:", error);
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stripe Checkout Route
  app.post("/api/create-checkout-session", async (req, res) => {
    const { amount, currency = "usd", successUrl, cancelUrl, donorName, donorEmail } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: "Donation to Vic's Animal Shelter",
                description: "Thank you for supporting our animals!",
              },
              unit_amount: Math.round(amount * 100), // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl || `${req.headers.origin}/donate?success=true`,
        cancel_url: cancelUrl || `${req.headers.origin}/donate?canceled=true`,
        customer_email: donorEmail,
        metadata: {
          donorName: donorName || "Anonymous",
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message });
    }
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

  // Sync user profile and set custom claims (Secure RBAC initialization)
  app.post("/api/auth/sync-profile", async (req, res) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Missing token" });

    try {
      const decodedToken = await adminAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const email = decodedToken.email;
      const name = decodedToken.name || email?.split('@')[0] || 'User';

      const userRef = adminDb().collection("users").doc(uid);
      const userDoc = await userRef.get();

      let role = "basicUser";
      
      // Auto-promote admin emails
      const adminEmails = ['brennanxd0@gmail.com', 'brennan.xd0@gmail.com', 'vicsshelter@gmail.com'];
      if (email && adminEmails.includes(email)) {
        role = "admin";
      }

      if (!userDoc.exists) {
        // Create new profile
        const newUser = {
          name,
          email,
          role,
          createdAt: new Date().toISOString()
        };
        await userRef.set(newUser);
      } else {
        // Update existing profile if role needs to be set (e.g. first time login for existing auth user)
        const existingData = userDoc.data();
        if (!existingData?.role) {
          await userRef.update({ role });
        } else {
          role = existingData.role;
        }
      }

      // Set custom claims for RBAC
      await adminAuth().setCustomUserClaims(uid, { role });

      res.json({ id: uid, role, name, email });
    } catch (error) {
      console.error("Error syncing profile:", error);
      res.status(500).json({ error: "Failed to sync profile" });
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
    app.get("*all", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
