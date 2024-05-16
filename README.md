# Routex Demo

This is a sample application that shows how to use [YAXI](https://yaxi.tech)'s routex services:

- CollectPayment: transfer money from any account to a pre-defined account
- Transactions: retrieve account information (i.e. transactional data) for bank accounts. The app asks for a bank and credentials and then retrieves account information for all accounts accessible for the given credentials and optionally sends it to a pre-configured webhook.

The app consists of two separate projects:

- a backend in Spring Boot which issues tickets (it's how routex's authentication is called) for the frontend and a webhook that receives the data. The webhook also validates that the data originated from routex.
- a React frontend for user interaction

## How to run the demo

* First, create a [YAXI account](https://hub.yaxi.tech/sign-up) if not done already
* [Create a new API key](https://hub.yaxi.tech/api-keys/new) for the integration environment
* Edit `backend/src/main/resources/application.yaml` and fill in the API key you created
* Change to the `backend` directory and run `./mvnw spring-boot:run` (requires a Java Development Kit)
* (In another terminal) Change to the `routex-react-demo` directory and run `npm install` followed by `npm run dev` (requires NodeJS and npm)
* Visit http://localhost:5173

## Limitations

The frontend doesn't check for expired tickets. If you use the app for longer than 10 minutes after the first load, you will get error responses and need to reload.

## Documentation

The general routex documentation can be found [here](https://docs.yaxi.tech/getting-started.html).

## License

The code in this repository is licensed under the [Unlicense](https://unlicense.org/). For licensing information on any of the project's dependencies, please refer to their documentation and licenses.
