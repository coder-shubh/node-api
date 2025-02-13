const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
} = require("graphql");
const bcrypt = require("bcryptjs");
const User = require("./userSchema"); // Your Mongoose User model

// User Type (based on your Mongoose schema)
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    profilePic: { type: GraphQLString },
    createdAt: { type: GraphQLString }, // If you want to expose the creation date
  }),
});

// Pagination Info Type
const PaginationType = new GraphQLObjectType({
  name: "Pagination",
  fields: () => ({
    currentPage: { type: GraphQLInt },
    totalPages: { type: GraphQLInt },
    totalUsers: { type: GraphQLInt },
  }),
});

// Root Query Type
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    users: {
      type: new GraphQLObjectType({
        name: "UsersResponse",
        fields: () => ({
          users: { type: new GraphQLList(UserType) },
          pagination: { type: PaginationType },
        }),
      }),
      args: {
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
      },
      resolve: async (parent, { page = 1, limit = 10 }) => {
        const skip = (page - 1) * limit;
        const users = await User.find().skip(skip).limit(limit);
        const totalUser = await User.countDocuments();
        return {
          users,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalUser / limit),
            totalUsers: totalUser,
          },
        };
      },
    },
    // New query for finding a user by ID
    userById: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (parent, { id }) => {
        try {
          const user = await User.findById(id);
          if (!user) {
            throw new Error("User not found");
          }
          return user;
        } catch (error) {
          throw new Error("Error fetching user: " + error.message);
        }
      },
    },
  },
});

// const RootQuery = new GraphQLObjectType({
//   name: "RootQueryType",
//   fields: {
//     users: {
//       type: new GraphQLObjectType({
//         name: "UsersResponse",
//         fields: () => ({
//           users: { type: new GraphQLList(UserType) },
//           pagination: { type: PaginationType },
//         }),
//       }),
//       args: {
//         page: { type: GraphQLInt },
//         limit: { type: GraphQLInt },
//       },
//       resolve: async (parent, { page = 1, limit = 10 }) => {
//         const skip = (page - 1) * limit;
//         const users = await User.find().skip(skip).limit(limit);
//         const totalUser = await User.countDocuments();
//         return {
//           users,
//           pagination: {
//             currentPage: page,
//             totalPages: Math.ceil(totalUser / limit),
//             totalUsers: totalUser,
//           },
//         };
//       },
//     },
//   },
// });

// Mutation Type (for creating users or updating data)
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Example mutation for creating a user
    createUser: {
      type: UserType,
      args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        profilePic: { type: GraphQLString },
      },
      resolve: async (
        parent,
        { username, email, password, firstName, lastName, profilePic }
      ) => {
        // Hash password before saving (matching your pre-save hook in Mongoose)
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
          username,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          profilePic,
        });

        return await newUser.save();
      },
    },
  },
});

// Schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

module.exports = schema;
