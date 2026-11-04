// Lane E (George). The live site's backend: one Cloud Function, `api`, that runs the same request handler as
// `npm start` in server/. Firebase Hosting sends /api/** here (firebase.json). Sessions and rate-limit counters
// live in Firestore because a function can run on several machines and restart at any time.
// Keys come from Function secrets (firebase functions:secrets:set GROQ_API_KEY), never from the deployed files.

import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
import { createApp, selectProvider, setStore, type Session, type Store } from "../../server/index.js";

const GROQ_API_KEY = defineSecret("GROQ_API_KEY");

initializeApp();
const db = getFirestore();
const DAY = 24 * 3600_000;

// Old documents are harmless; add a Firestore TTL policy on `expiresAt` (collections sessions, rate) to clean them up.
const firestoreStore: Store = {
  async load(id) {
    const doc = await db.collection("sessions").doc(id).get();
    return doc.exists ? (JSON.parse(doc.get("data")) as Session) : undefined;
  },
  async save(id, s) {
    await db.collection("sessions").doc(id).set({ data: JSON.stringify(s), expiresAt: new Date(Date.now() + DAY) });
  },
  async tick(ip) {
    const now = Date.now();
    const bump = (key: string) => {
      const ref = db.collection("rate").doc(key);
      return db.runTransaction(async (t) => {
        const n = ((await t.get(ref)).get("n") ?? 0) + 1;
        t.set(ref, { n, expiresAt: new Date(now + 2 * DAY) });
        return n as number;
      });
    };
    const who = createHash("sha256").update(ip).digest("hex").slice(0, 24);
    const [ipHour, day] = await Promise.all([
      bump(`ip-${who}-${Math.floor(now / 3600_000)}`), // a clock-hour bucket, close enough to "per hour"
      bump(`day-${new Date(now).toISOString().slice(0, 10)}`),
    ]);
    return { ipHour, day };
  },
};

let app: ReturnType<typeof createApp> | undefined;

export const api = onRequest(
  { region: "europe-west2", secrets: [GROQ_API_KEY], timeoutSeconds: 120, memory: "512MiB", maxInstances: 10 },
  (req, res) => {
    if (!app) {
      setStore(firestoreStore);
      selectProvider();
      app = createApp();
    }
    app.emit("request", req, res); // the server's own handler: routes, input checks, limits, error replies
  },
);
