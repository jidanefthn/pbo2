import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Cinema Ticket Booking API",
      version: "1.0.0",
      description: "API documentation for Cinema Ticket Booking System",
    },

    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local Development Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            name: {
              type: "string",
              example: "Hakim",
            },

            email: {
              type: "string",
              example: "hakim@gmail.com",
            },

            role: {
              type: "string",
              example: "user",
            },
          },
        },

        Movie: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            title: {
              type: "string",
              example: "Avengers Endgame",
            },

            genre: {
              type: "string",
              example: "Action",
            },

            duration: {
              type: "integer",
              example: 180,
            },

            description: {
              type: "string",
              example: "Superhero movie",
            },
          },
        },

        Studio: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            name: {
              type: "string",
              example: "Studio 1",
            },

            total_seats: {
              type: "integer",
              example: 100,
            },

            is_active: {
              type: "boolean",
              example: true,
            },
          },
        },

        Schedule: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            movie_id: {
              type: "integer",
              example: 1,
            },

            studio_id: {
              type: "integer",
              example: 1,
            },

            show_date: {
              type: "string",
              example: "2026-05-10",
            },

            show_time: {
              type: "string",
              example: "19:00",
            },
          },
        },

        Seat: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            schedule_id: {
              type: "integer",
              example: 1,
            },

            seat_number: {
              type: "string",
              example: "A1",
            },

            status: {
              type: "string",
              example: "available",
            },
          },
        },

        Booking: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            user_id: {
              type: "integer",
              example: 1,
            },

            schedule_id: {
              type: "integer",
              example: 1,
            },

            total_price: {
              type: "integer",
              example: 50000,
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
