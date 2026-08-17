export const config = {
  port: Number(process.env.PORT ?? 3000),
  cors: {
    origins: ["http://localhost:5173", "https://laila.web.app", "https://laila.firebaseapp.com"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
  bodyLimit: "10kb",
};