# integer-increment-test-task-vasitum

This repository is a basic attempt to provide solution to vasitum's test task mentioned in the following [gist](https://gist.github.com/ankitwww/a519ebfd040bc171554ea2e9c0cfbe3e).

## project setup

Once you clone the repository on your local machine you can use the following commands to install project dependencies:

```sh
cd path/to/project

npm install
```

You will also need to start mongodb. You can refer [this page](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) in Mongo's documentation to setup the required tools on ubuntu. If you are not using ubuntu please choose appropriate guide according to your OS [here](https://docs.mongodb.com/manual/administration/install-community/). Movin ahead i will asume you are using a linux based OS, to start the mongoDB service you can use either of the following commands:

```sh
sudo service mongod start

# OR

sudo systemctl start mongod
```

Now you should be able start the application on your local machine using:

```sh
npm start

#  To run in dev mode use:
npm run start-dev
```

> Note: You can update the secret used to generate JWT tokens in this project by updating the secret param in config.json file.

## playing with the project

The project exposes 10 APIs which will be detailed below. You can use curl or Postman to access the local version of the project running on your system.

You can import my postman collection using the following link: [https://www.getpostman.com/collections/6a3638f855ce82c0a859](https://www.getpostman.com/collections/6a3638f855ce82c0a859)

> Note: You will need to update token in Autherization tab within Postman

For the purpose of this Readme I will focus on curl examples to understand the required set of APIs:

### Main APIs

#### User registration

This API can be accessed without authentication. It takes in as input "firstName", "lastName", "username", "password" and "email". Here username and email should be unique for every user.

```sh
curl --location --request POST 'http://localhost:4000/v1/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "firstName": "Ayush",
    "lastName": "Tiwari",
    "username": "ayusht22",
    "password": "my-super-secret-password-2",
    "email": "ayush.t0011@outlook.com"
}'

# Output:
{"success":true}
```

#### Token generation (authentication)

Token generation API can also be accessed without prior authentication, though it requires username and password of a pre registered user. The following example uses `jq` to store the returned token in an ENV variable, to make remaining curl requests feasible. You can also strip the command of `jq` and import token manually in the below commands.

```sh
TOKEN=$(curl --location --request POST 'http://localhost:4000/v1/users/authenticate' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "ayusht22",
    "password": "my-super-secret-password-2"
}'| jq '.token' -r)

# Output:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   421  100   345  100    76   3287    724 --:--:-- --:--:-- --:--:--  3285

```

#### Get current identifier

I have stored an identifier with respect to each user. the user will be identified using the token passed. On creation each identifier is defaulted to zero. I have modified the curl request mentioned in the test task and returned a JSON instead of returning the number directly. Calling this API will increment the current identifier for the user So in the next call it will be incremented by 1.

```sh
curl --location --request GET 'http://localhost:4000/v1/current' \
--header "Authorization: Bearer $TOKEN"

# Output:
{"current":0}
```

#### Get next identifier

You can use the following command to get the next identifier for a particular user. Calling this API will increment the current identifier for the user So in the next call it will be incremented by 1.

```sh
curl --location --request GET 'http://localhost:4000/v1/next' \
--header "Authorization: Bearer $TOKEN"

# Output:
{"next":2}
```

#### Update identifier

We can update the identifier to any Integer using the following `curl` command. In the example below we have updated the current identifier to 100.

```sh
curl --location --request PUT 'http://localhost:4000/v1/current' \
--header "Authorization: Bearer $TOKEN" \
--header 'Content-Type: application/json' \
--data-raw '{
    "current": 100
}'

# Output:
{"success":true}
```

You can fire the following `curl` to check the updated value:

```sh
curl --location --request GET 'http://localhost:4000/v1/current' \
--header "Authorization: Bearer $TOKEN"

# Output:
{"current":100}
```

> Note: The update curl has been purposefully modified to keep the json/application interface uniform throughout our API set.

### Bonus APIs

These are some additional APIs useful in user management:

#### Get all users

This API can be used to fetch all users, it needs authentication.

```sh
curl --location --request GET 'http://localhost:4000/v1/users/' \
--header "Authorization: Bearer $TOKEN"

# Sample Output:
[{"identifier":0,"firstName":"ABC","lastName":"XYZ","username":"ayusht11","email":"ayusht11@outlook.com","createdDate":"2020-06-28T21:33:27.633Z","id":"5ef90ca738332d3c095468be"},{"identifier":0,"firstName":"Ayush","lastName":"Tiwari","username":"ayusht22","email":"ayush.t0011@outlook.com","createdDate":"2020-06-28T21:34:40.684Z","id":"5ef90cf038332d3c095468bf"}]
```

#### Update User

This API can be used to update user information, additionally this can be used to update the identifier as well.

```sh
curl --location --request PUT 'http://localhost:4000/v1/users/5ef90cf038332d3c095468bf' \
--header "Authorization: Bearer $TOKEN" \
--header 'Content-Type: application/json' \
--data-raw '{
    "firstName": "Foo",
    "lastName": "Bar"
}'

# Output:
{"success":true}
```

#### Get Current User

This API returns the current user using the Authentication token.

```sh
curl --location --request GET 'http://localhost:4000/v1/users/current' \
--header "Authorization: Bearer $TOKEN"

# Output:
{"identifier":0,"firstName":"Foo","lastName":"Bar","username":"ayusht22","email":"ayush.t0011@outlook.com","createdDate":"2020-06-28T21:34:40.684Z","id":"5ef90cf038332d3c095468bf"}
```

#### Get user By ID

This API returns a user for the given ID in the URL. Here `5ef90cf038332d3c095468bf` is our user ID. it will also require authentication but no check is performed to confirm the authentication is from the same user as the given ID.

```sh
curl --location --request GET 'http://localhost:4000/v1/users/5ef90cf038332d3c095468bf' \
--header "Authorization: Bearer $TOKEN"

# Output:
{"identifier":0,"firstName":"Foo","lastName":"Bar","username":"ayusht22","email":"ayush.t0011@outlook.com","createdDate":"2020-06-28T21:34:40.684Z","id":"5ef90cf038332d3c095468bf"}
```

#### Delete current user

This API can be used to delete the current user from the record. Current user is identified using the token.

```sh
curl --location --request DELETE 'http://localhost:4000/v1/users/current' \
--header "Authorization: Bearer $TOKEN"
```

## Future enhancements

This test task was performed in a limited time duration, in addition to the points mentioned in the gist we can take it further by:

- Adding mocha, chai and sinon unit test cases
- Dockerizing the Application
- Making the App more robust by improving error handling
