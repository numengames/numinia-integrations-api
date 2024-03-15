FROM node:20 AS build

WORKDIR /home/node/app

COPY package*.json ./
COPY tsconfig.json .
COPY .npmrc .
COPY src ./src

RUN npm install \
  && rm -f .npmrc \
  && npm run build

# Second stage: run things.
FROM node:20

ENV NODE_ENV production

WORKDIR /home/node/app

COPY package*.json ./
COPY .npmrc .

RUN npm install --only=production \
  && rm -f .npmrc

COPY --from=build --chown=node:node /home/node/app/dist ./dist

RUN mkdir -p uploads
RUN chown -R node:node uploads

USER node

EXPOSE 8000

CMD ["npm", "run", "start:pro"]