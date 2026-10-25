const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "https://laila.web.app",
  "https://laila.firebaseapp.com",
  "https://gviano.web.app",
  "https://gviano.firebaseapp.com",
  "https://gviano.com",
  "https://www.gviano.com",
];

export const config = {
  port: Number(process.env.PORT ?? 3000),
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim()).filter(Boolean)
      : DEFAULT_CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  bodyLimit: "10kb",
  db: {
    url: process.env.DATABASE_URL
  }
};
