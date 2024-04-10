# Numinia Integrations API

> "The tech gate of Numinia with the external partners"

This API is designed to facilitate communication and integration with external services used by the Numinia ecosystem.

## Instalation

To get started with this project, follow these steps:

1. Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/numinia-integrations-api.git
```

2. Install dependencies using npm:

```bash
npm install
```

## Configuration

Before running the API, you need to set up some environment variables. Create a .env file in the project's root directory and define the following variables:

```
DISCORD_WEBHOOK_URL=YOUR_DISCORD_WEBHOOK_URL_HERE
```

## Usage

Once you have configured the environment variables, you can start the server locally by running:

## Features

### Send a notification to discord

It currently includes functionality to integrate with Discord for sending push notifications but aims to be the gateway for integrations with all Numinia services, including OpenAI, payment gateways, and more.

- URL: `/api/discord/notify`
- Method: `POST`
- Request Body:
```json
{
  "message": "Example message that will be sent to Discord."
}
```
- Successful Response: `202 OK`
- Error Response: `4xx` or `5xx` with descriptive message.

## Contributing

We welcome contributions! If you'd like to improve this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (git checkout -b feature/awesome-feature).
3. Make your changes and commit them (git commit -am 'Add an awesome feature').
4. Push the branch (git push origin feature/awesome-feature).
5. Open a pull request.

## 📜 License

Code released under the [CCO License](https://creativecommons.org/publicdomain/zero/1.0/).

Copyright (c) 2024, NumenGames