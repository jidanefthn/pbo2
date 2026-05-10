import express from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./docs/swagger";

import authRoutes from "./routes/authRoutes";
import movieRoutes from "./routes/movieRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import studioRoutes from "./routes/studioRoutes";
import seatRoutes from "./routes/seatRoutes";
import bookingRoutes from "./routes/bookingRoutes";

const app = express();

// MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// SWAGGER DOCUMENTATION
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cinema Ticket Booking API Running",
  });
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// GLOBAL ERROR HANDLER
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
);

export default app;
