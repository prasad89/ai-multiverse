FROM node

WORKDIR /react_frontend

COPY package.json package-lock.json /react_frontend/

RUN npm install

COPY . /react_frontend

EXPOSE 3000

CMD ["npm", "start"]
