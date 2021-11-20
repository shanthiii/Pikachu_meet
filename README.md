# Pikachu_meet

Pikachu meet is a video conferencing application using HTML, CSS, JavaScript, Node.js, Express.js, PeerJS, Socket.io, EJS, uuid, mysql, npm and nodemon. It is a social networking digital communication web application that provides video chat between computers, tablets and mobile devices through a web browser.

## Get started

- Clone the repository

```console
git clone https://github.com/shanthiii/Pikachu_meet.git
```

- Install dependencies

```console
npm i -g peer
npm i
```

- Start server
  - Back-end server in one terminal
    ```console
    npm run devStart
    ```
  - WebRTC server in another terminal
    ```console
    peerjs --port 3001
    ```
- [Navigate to localhost on port 3000 in browser](http://localhost:3000)

### Design

![Flowchart showing connections of webpages](flowchart.png)
