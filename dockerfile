FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

COPY . .

EXPOSE 8080
EXPOSE 8s443

CMD [ "node", "index.js" ]