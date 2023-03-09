const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { findOneAndUpdate } = require('../models/User');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks')

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await User.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user};
        },
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
            if (context.user) {
                const updatedUser = await findOneAndUpdate(
                    { _id: context.user.id },
                    { 
                        $addToSet: {
                            savedBooks: { authors, description, title, bookId, image, link},
                        },
                    },
                    { new: true, runValidators: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook: async(parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user.id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );


                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },

    },

};



module.exports = resolvers;