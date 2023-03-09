import { gql } from '@apollo/client';

const GET_ME = gql`
    query {
        me {
            _id
            username
            email
            bookCount
            savedBooks {
                bookId
                authors
                description
                title
                image
                link
            }
        }
    }
`

module.exports = GET_ME;
