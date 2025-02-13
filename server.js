const express = require("express");
const mongoose = require("mongoose");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoute");
const foodRoutes = require("./routes/foodRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");
const path = require("path");
const uploadRoutes = require("./routes/uploadRoutes");
const foodCategoryRoute = require("./routes/foodCategoryRoutes");
const orderRoute = require("./routes/orderRoute");
const userAddressRoutes = require("./routes/userAddressRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./models/userGraphqlSchema");
const XMCategoryRoute = require("./routes/XMood/XMCategoryRoute");
const XMPhotoRoute = require("./routes/XMood/XMPhotoRoute");
const XMStoryRoute = require("./routes/XMood/XMStoryRoute");
const XMUserRouter = require("./routes/XMood/XMUserRouter");
const XMAppOpenCountRouter = require("./routes/XMood/XMAppOpenCountRouter");
const XMOnboardRoute = require("./routes/XMood/XMOnboardRoute");
const XMReelRoute = require("./routes/XMood/XMReelRoute");






// console.log("GraphQL Schema loaded:", userGraphqlSchema);
//INVIA
// const uri =
//   "mongodb+srv://new-user-31:BVjbKBhcu8puOKC3@cluster19986.4ktj0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster19986";

//MAVESYSSHUBHAM:
const uri =
  "mongodb+srv://shubhammavesys:pKgkNeTbUv28ht4m@cluster0.im52i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create Express ap
const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Routes
app.use("/api", userRoutes);
app.use("/api", itemRoutes);
app.use("/api", categoryRoutes);
app.use("/api", foodCategoryRoute);
app.use("/api", foodRoutes);
app.use("/api", uploadRoutes);
app.use("/api", orderRoute);
app.use("/api", userAddressRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api", XMCategoryRoute);
app.use("/api", XMPhotoRoute);
app.use("/api", XMStoryRoute);
app.use("/api", XMUserRouter);
app.use("/api", XMAppOpenCountRouter);
app.use("/api", XMOnboardRoute);
app.use("/api", XMReelRoute);






app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true, // This allows you to interact with the GraphQL API via a web interface
  })
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // This will serve your Swagger docs at /api-docs
app.use("/uploads", express.static(path.join(__dirname, "routes", "uploads")));
