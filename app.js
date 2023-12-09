const express = require('express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/static', express.static('static'));
app.use(express.urlencoded());

// Replace 'YOUR_MONGODB_ATLAS_CONNECTION_STRING' with your MongoDB Atlas connection string
const DB = 'mongodb+srv://pkb3468:Ae60ONbfs7xaFIV3@cluster0.rvecfbo.mongodb.net/MyDB?retryWrites=true&w=majority';

mongoose.connect(DB)
  .then(() => {
    console.log('DB connected');
  })
  .catch((err) => {
    console.log('Not connected to DB', err);
  });




  app.use(session({
    secret: 'user-details', // Change this to a secret key for session management
    resave: false,
    saveUninitialized: true,
  }));

  const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

const User = mongoose.model('User', userSchema);

let valid=true;


app.get("/registration", (req, res) => {
    
    res.render('registration.pug');
})

app.post("/register-post", async (req, res) => {
    const { username, password } = req.body;

    try {
      const newUser = new User({ username, password  });
      await newUser.save();
      console.log('New User stored successfully');
      res.redirect('/');
    } catch (error) {
      console.error('Error storing message', error);
      res.status(500).send('Internal Server Error');
    }
})






app.get("/login", (req, res) => {
    res.render('login.pug');
})

app.post("/login-post", (req, res) => {
    const { username, password } = req.body;
    req.session.userdetails = { username, password };
    User.findOne({ username })
        .then((user) => {
            if (!user) {
                return res.status(500).json({ error: 'Invalid username' })
            }
            if (password === user.password) {

                valid = true;
                return res.status(210).redirect('/');
            }
            else {
                // return res.status(401).redirect('/');
                return res.status(401).json({ error: 'password not found' });
            }
        })
        .catch((error) => {
            console.error('login error', error);
            return res.status(500).json({ error: 'Invalid Login' })
        })
})

const isAuthenticated = (req, res, next) => {
  if (!req.session.userdetails) {
    // return res.status(401).json({ error: 'Unauthorized' });
    return res.redirect('/login');
  }
  next();
};

app.get("/",isAuthenticated, (req, res) => {

      return res.redirect('/home');
 
})










//Message information


const messageSchema = new mongoose.Schema({
  text: String,
  sender: { type: String, default: "anonymus-user" },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

app.get('/home',isAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find();
    const users = await User.find();
    // res.render('index', { messages });
    res.render('home',{ messages ,users});
  } catch (error) {
    console.error('Error retrieving messages', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/post-message',isAuthenticated, async (req, res) => {
  const {text} = req.body;
  
  try {
    const sender = req.session.userdetails.username;
   
    const newMessage = new Message({text, sender});
    await newMessage.save();
    console.log('Message stored successfully');
    return res.status(220).redirect('/');
  } catch (error) {
    console.error('Error storing message', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get("/posts", isAuthenticated,(req, res) => {
  res.render('post.pug');
})

app.get("/details", isAuthenticated,(req, res) => {
  // Retrieve user information from the session
  const user = req.session.userdetails;

  // Check if the user is logged in
  // if (!user) {
  //   return res.redirect('/login');
  // }

  res.render('details.pug', { user });
 
})

app.get("/logout", (req, res) => {
  valid=false;
  req.session.userdetails= null;
  return res.status(220).redirect('/login');
  
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
