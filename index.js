require("dotenv").config();
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("This is from Backend");
});

const server = app.listen(PORT, () => {
  console.log(`server started on http://localhost:${PORT}`);
});


const io = socketIo(server,{
  pingTimeout:60000,
  cors:{
    origin:process.env.FRONTEND_URL
  }
});

io.on('connection', (socket) => {
  console.log('User connected to socket.io');
  
  // Listening for new messages
  socket.on('newMessageFromFrontend', async (data) => {
    try {
      io.emit('newMessageFromBackend', data);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
  // Listening for updates in likes
  socket.on("like", (data) => {
    const { messages, messageId, likes } = data;
    try {
      const messageToUpdate = messages.find((message) => message.id === messageId);

      if (messageToUpdate) {
        messageToUpdate.likes = likes;
        io.emit("like", { messageId, likes: messageToUpdate.likes });
      }
    } catch (error) {
      console.error("Error handling like", error);
    }
  });
});