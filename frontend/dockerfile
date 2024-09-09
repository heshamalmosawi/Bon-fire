FROM node:22

WORKDIR /frontendapp

COPY package*.json  yarn.lock* ./
RUN npm install && yarn install

COPY . .

# bulding the app (TODO: change to build later)
# RUN yarn build 

EXPOSE 3000

CMD ["yarn", "dev"]