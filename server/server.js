const express = require('express');
const path = require('path');
const db = require('./config/connection');
// const routes = require('./routes');

// Importing new external modules
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth')
const { typeDefs, resolvers } = require('./schemas')


const app = express();
const PORT = process.env.PORT || 3001;


// Creating an ApolloServer instance with the required schema and resovlers and also
// adding option context object with authentication middleware
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// Function to start the Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start()
  server.applyMiddleware({ app });

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
};

// Call the async function to start the server
startApolloServer();

