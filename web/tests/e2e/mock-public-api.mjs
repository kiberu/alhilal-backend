import http from "node:http";

import { publicTripDetailsBySlug, publicTripListResponse } from "../qa/public-site-fixtures.mjs";

const port = 4010;
const leads = [];

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    writeJson(response, 204, {});
    return;
  }

  if (url.pathname === "/health") {
    writeJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/v1/public/trips/") {
    writeJson(response, 200, publicTripListResponse);
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/v1/public/trips/slug/")) {
    const slug = url.pathname.replace("/api/v1/public/trips/slug/", "").replace(/\/$/, "");
    const payload = publicTripDetailsBySlug[slug];
    if (!payload) {
      writeJson(response, 404, { detail: "Not found." });
      return;
    }

    writeJson(response, 200, payload);
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/v1/public/trips/")) {
    const tripId = url.pathname.replace("/api/v1/public/trips/", "").replace(/\/$/, "");
    const payload = Object.values(publicTripDetailsBySlug).find((trip) => trip.id === tripId);
    if (!payload) {
      writeJson(response, 404, { detail: "Not found." });
      return;
    }

    writeJson(response, 200, payload);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/public/leads/") {
    try {
      const payload = await parseBody(request);
      const requiredFields = ["name", "interest_type", "source", "page_path", "context_label", "cta_label"];
      const missingField = requiredFields.find((fieldName) => !payload[fieldName]);
      if (missingField) {
        writeJson(response, 400, {
          error: {
            fields: {
              [missingField]: ["This field is required."],
            },
          },
        });
        return;
      }

      if (payload.interest_type === "CONSULTATION" && !payload.phone) {
        writeJson(response, 400, {
          error: {
            fields: {
              phone: ["This field is required for consultation requests."],
            },
          },
        });
        return;
      }

      const saved = {
        id: `lead-${leads.length + 1}`,
        status: "NEW",
        created_at: new Date().toISOString(),
        ...payload,
      };
      leads.push(saved);
      writeJson(response, 201, saved);
      return;
    } catch {
      writeJson(response, 400, { detail: "Invalid JSON payload." });
      return;
    }
  }

  writeJson(response, 404, { detail: "Not found." });
});

server.listen(port, "127.0.0.1");

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
