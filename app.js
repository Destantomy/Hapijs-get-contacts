/* eslint-disable no-unused-vars */
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Pusher = require('pusher');
const Path = require('path');

// Init Pusher
const pusher = new Pusher({
  appId: 'enter_yours',
  key: 'enter_yours',
  secret: 'enter_yours',
  cluster: 'enter_yours',
  encrypted: true,
});

const server = Hapi.server({
  port: 4000,
  host: 'localhost',
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'public'),
    },
  },
});

const init = async () => {
  // register static content plugin
  await server.register(Inert);

  // index routing / homepage
  server.route({
    method: 'GET',
    path: '/',
    handler: {
      file: 'index.html',
    },
  });

  // save contact
  server.route({
    method: 'POST',
    path: '/contact',
    handler(request, h) {
      const { contact } = JSON.parse(request.payload);
      const randomNumber = Math.floor(Math.random() * 100);
      const genders = ['men', 'women'];
      const randomGender = genders[Math.floor(Math.random() * genders.length)];
      Object.assign(contact, {
        id: `contact-${Date.now()}`,
        image: `https://randomuser.me/api/portraits/${randomGender}/${randomNumber}.jpg`,
      });
      pusher.trigger('contact', 'contact-added', { contact });
      return contact;
    },
  });

  // delete contact
  server.route({
    method: 'DELETE',
    path: '/contact/{id}',
    handler(request, h) {
      const { id } = request.params;
      pusher.trigger('contact', 'contact-deleted', { id });
      return id;
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
