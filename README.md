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

> Functionality to integrate with Discord for sending push notifications.

- URL: `/api/v1/discord/sendWebHook`
- Method: `POST`
- Request Body:
```json
{
  "season": 1,
  "userName": "Test",
  "spaceName": "Steiner Dreams",
  "spaceUrl": "https://test.com",
  "walletId": "0x00000000000000000000dead",
}
```
- Successful Response: `204 OK`
- Error Response: `4xx` or `5xx` with descriptive message.

### Chat with openAI

> Functionality to send messages to chatGPT

- URL: `/api/v1/openai/send-text-message`
- Method: `POST`
- Request Body:
```json
{
  "message": "test",
  "temperature": "TEMP_LOW | TEMP_MEDIUM | TEMP_HIGH",
}
```
- Successful Response: `200 OK`
- Error Response: `4xx` or `5xx` with descriptive message.

### Chat with OpenAI assistant

> Functionality to send messages to a chatGPT preloaded numinia assistant

- URL: `/api/v1/openai/assistant/send-text-message`
- Method: `POST`
- Request Body:
```json
{
  "message": "test",
  "temperature": "TEMP_LOW | TEMP_MEDIUM | TEMP_HIGH",
  "assistant": "BOBA | GUMALA | THOTH | LYRA | SENET | NIMROD | PROCYON",
}
```
- Successful Response: `200 OK`
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