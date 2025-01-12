const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "NodeJS API",
    version: "1.0.0",
    description: "This is the API documentation for the Node application",
  },
  servers: [
    {
      url: "https://node-q31r.onrender.com",
      description: "Shubham Render server",
    },
  ],
  components: {
    // Define security schemes for authentication (e.g., Bearer JWT)
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    // Define reusable schema models (e.g., User schema)
    schemas: {
      User: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          _id: {
            type: "string",
            description: "The unique identifier for the user",
          },
          username: {
            type: "string",
            description: "The username of the user",
          },
          email: {
            type: "string",
            description: "The email of the user",
          },
          firstName: {
            type: "string",
            description: "The first name of the user",
          },
          lastName: {
            type: "string",
            description: "The last name of the user",
          },
          profilePic: {
            type: "string",
            description: "The profile picture URL of the user",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp of when the user was created",
          },
        },
      },
      Item: {
        type: "object",
        required: ["name", "category", "quantity"],
        properties: {
          _id: {
            type: "string",
            description: "The unique identifier of the item",
          },
          name: {
            type: "string",
            description: "The name of the item",
          },
          description: {
            type: "string",
            description: "A description of the item",
          },
          quantity: {
            type: "number",
            description: "The quantity of the item in stock",
          },
          category: {
            type: "string",
            description: "The ID of the category this item belongs to",
          },
        },
      },
      Category: {
        type: "object",
        required: ["categoryName"],
        properties: {
          _id: {
            type: "string",
            description: "The unique identifier of the category",
          },
          categoryName: {
            type: "string",
            description: "The name of the category",
          },
        },
      },
      Food: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the food item",
            example: "Pizza",
          },
          description: {
            type: "string",
            description: "A description of the food item",
            example: "A delicious cheese pizza",
          },
          price: {
            type: "number",
            description: "Price of the food item",
            example: 9.99,
          },
          image: {
            type: "string",
            description: "URL for the food image",
            example: "https://example.com/pizza.jpg",
          },
          category: {
            type: "string",
            description: "Food category",
            enum: ["vegetarian", "non-vegetarian", "vegan", "dessert"],
            example: "vegetarian",
          },
          ingredients: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Ingredients of the food item",
            example: ["Cheese", "Tomato", "Dough"],
          },
          isAvailable: {
            type: "boolean",
            description: "Availability of the food item",
            example: true,
          },
          rating: {
            type: "number",
            description: "Rating of the food item",
            minimum: 1,
            maximum: 5,
            example: 4,
          },
          servings: {
            type: "number",
            description: "Number of servings",
            example: 2,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
            example: "2024-12-18T12:00:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last updated timestamp",
            example: "2024-12-19T12:00:00Z",
          },
        },
      },
      Order: {
        type: "object",
        required: ["user", "items", "totalAmount"],
        properties: {
          _id: {
            type: "string",
            description: "The unique identifier for the order",
          },
          user: {
            type: "string",
            description: "The ID of the user who placed the order",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                foodItem: {
                  type: "string",
                  description: "The food item ID",
                },
                quantity: {
                  type: "number",
                  description: "The quantity of the food item",
                },
                price: {
                  type: "number",
                  description: "Price of the food item",
                },
              },
            },
            description: "Array of items in the order",
          },
          totalAmount: {
            type: "number",
            description: "Total cost of the order",
          },
          status: {
            type: "string",
            enum: ["pending", "completed", "canceled"],
            description: "Current status of the order",
            example: "pending",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the order was placed",
            example: "2024-12-18T12:00:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the order was last updated",
            example: "2024-12-19T12:00:00Z",
          },
        },
      },
      Address: {
        type: "object",
        required: ["street", "city", "state", "zipCode", "country"],
        properties: {
          _id: {
            type: "string",
            description: "The unique identifier for the address",
          },
          street: {
            type: "string",
            description: "Street address of the user",
            example: "123 Main St",
          },
          city: {
            type: "string",
            description: "City of the address",
            example: "Springfield",
          },
          state: {
            type: "string",
            description: "State of the address",
            example: "IL",
          },
          zipCode: {
            type: "string",
            description: "Zip code of the address",
            example: "62704",
          },
          country: {
            type: "string",
            description: "Country of the address",
            example: "USA",
          },
          isPrimary: {
            type: "boolean",
            description: "Flag to mark this address as primary",
            example: true,
          },
          userId: {
            type: "string",
            description: "ID of the user to which the address belongs",
            example: "user123",
          },
        },
      },
      Subscription: {
        type: "object",
        required: ["user", "plan", "mealType", "price", "mealCount", "freeDelivery"],
        properties: {
          _id: {
            type: "string",
            description: "The unique identifier for the subscription",
          },
          user: {
            type: "string",
            description: "The user ID or username associated with the subscription",
          },
          plan: {
            type: "string",
            description: "Subscription plan (e.g., Weekly, Monthly)",
          },
          mealType: {
            type: "string",
            description: "Type of meal (e.g., Veg, Non-Veg)",
          },
          price: {
            type: "string",
            description: "The price of the subscription (e.g., '$25 / week')",
            example: "$25 / week",
          },
          mealCount: {
            type: "number",
            description: "Number of meals per week",
            example: 5,
          },
          freeDelivery: {
            type: "boolean",
            description: "Whether free delivery is included in the subscription",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the subscription was created",
            example: "2024-12-18T12:00:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the subscription was last updated",
            example: "2024-12-19T12:00:00Z",
          },
        },
      },
    },
    // Define responses that can be reused
    responses: {
      UnauthorizedError: {
        description: "Unauthorized access",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Unauthorized",
                },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Resource not found",
                },
              },
            },
          },
        },
      },
      // Define other common responses like validation errors, etc.
    },
    // Define parameters that are reusable (like user ID)
    parameters: {
      userIdParam: {
        in: "path",
        name: "id",
        required: true,
        schema: {
          type: "string",
        },
        description: "The ID of the user",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js", "./models/*.js"], // Include routes and models for API documentation
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
