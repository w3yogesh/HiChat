// required dependency
const express = require("express");

const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
// required env string
const PORT = process.env.PORT;
const path = require("path");

const cron = require("node-cron");
const Message = require("./models/MsgModel");

// // connect with db
const dbConnect = require("./config/database");
// dbConnect();
// //
// app.use(
//   cors({
//     origin: ["http://localhost:3000"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// Connect to MongoDB by calling the imported connectDB function
dbConnect()
  .then(() => {
    // Start your server once the MongoDB connection is established
    const port = process.env.PORT || 3000;

    // Create the HTTP server
    const server = http.createServer(app);
    console.log("connected");
    // Attach Socket.io to the HTTP server
    const io = require("socket.io")(server, {
      cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    const userSocketMap = {};

    io.on("connection", (socket) => {
      // console.log("Connected to socket.io");

      socket.on("online", (userId) => {
        userSocketMap[userId] = socket.id;
        socket.join(userId);
        console.log("User Online:", userId);
        io.emit("onlineUsers", userSocketMap);
      });
    
      socket.on("disconnect", () => {
        // Remove the disconnected user from the userSocketMap
        const disconnectedUserId = Object.keys(userSocketMap).find(
          (key) => userSocketMap[key] === socket.id
        );
        if (disconnectedUserId) {
          delete userSocketMap[disconnectedUserId];
          console.log("User Disconnected:", disconnectedUserId);
          io.emit("onlineUsers", userSocketMap);
        }
      });

      socket.on("setup", (userId) => {
        socket.join(userId);
        socket.emit("connected");
        console.log("connected");
      });
      
      socket.on("typing", (myId, selectedId) => {
        console.log('typing...',myId,selectedId);
        socket.in(selectedId).emit('isTyping', selectedId);        
      });

      // socket.on("disconnect", () => {
      //   console.log("User disconnected");
      //   const disconnectedUserId = Object.keys(userSocketMap).find(
      //     (userId) => userSocketMap[userId] === socket.id
      //   );

      //   if (disconnectedUserId) {
      //     delete userSocketMap[disconnectedUserId];
      //     io.emit("onlineUsers", userSocketMap);
      //   }
      //   // socket.emit("onlineUsers", (userSocketMap)=>{
      //   //   console.log('sent')
      //   // } );
      //   // console.log(userSocketMap);
      // });

      socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
      });

      socket.on("new message", ({ newMessage, chatUsers }) => {
        if (chatUsers.length === 0)
          return console.log("chat.users not defined");
        chatUsers.forEach((user) => {
          if (user == newMessage.sender) return;
          socket.in(user).emit("message recieved", newMessage);
        });
      });

      socket.on("file", ({ chatUsers, newMessage, fileData }) => {
        if (chatUsers.length === 0)
          return console.log("chat.users not defined");
        chatUsers.forEach((user) => {
          if (user == newMessage.sender) return;
          socket.in(user).emit("file recieved", { fileData, newMessage });
          console.log("File Sent");
        });

        // const toSocket = userConnections.get(to);
        // if (toSocket) {
        //   toSocket.emit('file', { from: userId, filename});
        // }
        // console.log('File received:', filename);

        // Save the file to disk
        // fs.writeFileSync(`uploads/${data.filename}`, data.fileData);
      });

      socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
    });

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start the server:", error);
  });

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// // Schedule a task to run every minute
// cron.schedule('* * * * *', async () => {
//   const now = new Date();
//   try {
//     await Message.deleteMany({
//       deleteAt: { $lt: now, $ne: null } // Exclude documents where deleteAt is null
//     });
//     console.log('Expired messages deleted');
//   } catch (error) {
//     console.error('Error deleting messages:', error);
//   }
// });

app.use(cookieParser());
app.use(express.json());

// routing
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");

app.get("/", (req, res) => {
    res.send("API is running....");
  })
app.use("/api/v1", authRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", chatRoutes);
app.use("/api/v1", groupRoutes);

const uploadDirectory = path.join(__dirname, "/uploads/users/files");
app.use("/api/v1/fetchfile", express.static(uploadDirectory));

const profileDirectory = path.join(__dirname, "/uploads/users/profile");
app.use("/api/v1/fetchprofile", express.static(profileDirectory));
