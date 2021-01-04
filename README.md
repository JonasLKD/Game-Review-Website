# 5001CEM - Software Engineering Project (Game Reviews)

Build a community website to review games (you can choose what type). All the game details and reviews must be stored in a database.

---

## Links to Heroku Live Server and Personal GitHub (Git Actions & Auto Deployment)
**Note:** Please allow a couple of seconds for the Heroku site to start up as the database is cleared everyday or so.
1. **Heroku:** https://djondoj-sem1.herokuapp.com/
2. **Personal** GitHub: https://github.com/github-actions-project/djondoj-sem1-website 

---

## Testing Accounts
**Note:** All accounts with username `user[x]` the same password - `p455w0rd`. All accounts have 3 reviews already so another will be have to be registered to make a new review on a game. Their usernames will be listed below:
1. `user1`
2. `user2`
3. `user3`

---

## Completed Features:
### Stage 1
#### Part 1
The home screen should be viewable without the need to log in. It should display all the games that have been reviewed. For each there should be the following:

1. The name of the game.
2. The publisher.
3. The year of release.
4. A thumbnail of the game box cover.

#### Part 2
There should be a link on the home page to a page that allow logged-in users to add new games. This screen should ask for the following:

1. The game title
2. The publisher
3. The year of release
4. A full-sized image of the game box cover that has been uploaded from the user's computer.
5. A detailed, multi-line, formatted description.

#### Part 3
If a user clicks on the thumbnail or game title on the home screen, whether they are logged in or not, they should be taken to the game review screen, this includes:

1. Details of the game.
2. A list of the reviews given by the users with the most recent at the top and the oldest at the bottom. Each should include the name of the user, the date and the formatted text of their review.
3. If they are logged in they should also see a multi-line input box to allow them to post their review. If a user has already reviewed the game or they are not logged in, the input box should not be displayed.

### Stage 2
1. Each reviewed post should include the reviewer's first and last names as well as a profile picture (avatar) with a suitable default image used if this is not supplied. There will need to be a profile screen to allow users to update this information. Each user can only review each game once but they can edit their review.
2. Users should be able to flag a review as being unsuitable or inappropriate. Once more then a specified number of users have flagged a review it should become hidden and the admin user should be sent an email with a link to the review and the choice of either deleting it or approving it.