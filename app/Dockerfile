FROM node

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PASSWORD=password

RUN  mkdir -p /home/node-app

COPY ./app /home/node-app

CMD ["node","/home/node-app/server.js"]