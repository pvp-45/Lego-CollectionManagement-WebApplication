/********************************************************************************
* WEB322 – Assignment 06
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Pruthvi Patel Student ID: 170733216 Date:  11th December,2023
* Published URL: https://weak-pear-catfish-robe.cyclic.app/ 

********************************************************************************/


const express = require("express");
const app = express();
const authData = require("./modules/auth-service");
app.set('view engine', 'ejs');
const legoData = require("./modules/legoSets");
app.use(express.urlencoded({ extended: true }));
const clientSessions = require('client-sessions');

app.use(
  clientSessions({
    cookieName: 'session', 
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', 
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60, 
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

legoData.Initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Error initializing Lego Data:", error);
  });

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about"); 
});


app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData.getSetsByTheme(theme)
      .then((sets) => {
        res.render("sets", { page: req.path, sets });
      })
      .catch((error) => {
        res.status(404).render("404", { message: error });
      });
  } else {
    legoData.getAllSets()
      .then((objs) => {
        res.render("sets", { page: req.path, sets: objs });
      })
      .catch((error) => {
        res.status(500).render("404", { message: error });
      });
  }
});


app.get("/lego/sets/:numDemo", (req, res) => {
  let setNum = req.params.numDemo;
  legoData.getSetByNum(setNum)
    .then((obj) => {
      res.render("set", { page: req.path, set: obj });
    })
    .catch((error) => {
      res.status(404).send(error);
    });
}); 


app.get('/lego/addSet',ensureLogin, async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addSet', { themes });
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.post('/lego/addSet', ensureLogin, async (req, res) => {
  try {
    const setData = {
      set_num: req.body.set_num,
      name: req.body.name,
      year: parseInt(req.body.year),
      num_parts: parseInt(req.body.num_parts),
      img_url: req.body.img_url,
      theme_id: parseInt(req.body.theme_id),
    };
    await legoData.addSet(setData);
    res.redirect('/lego/sets');
  } catch (error) {
    res.status(500).render('500', { message: `Error adding set: ${error}, page: '/lego/addSet'` });
  }
});


app.get('/lego/editSet/:num',ensureLogin, async (req, res) => {
  try {
    const setNum = req.params.num;
    const [set, themes] = await Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()]);

    if (!set || !themes) {
      res.status(404).render('404', { message: 'Set or themes not found' });
    } else {
      res.render('editSet', { set, themes });
    }
  } catch (err) {
   
    res.status(500).render('500', { message: `An error occurred: ${err.message}` });
  }
});

app.post('/lego/editSet',ensureLogin, async (req, res) => {
  try {
    const setNum = req.body.set_num;
    const setData = req.body;

    await legoData.editSet(setNum, setData);
    res.redirect('/lego/sets');
  } catch (err) {
  
    res.status(500).render('500', { message: `An error occurred: ${err.message}` });
  }
});

app.get('/lego/deleteSet/:num', ensureLogin,async (req, res) => {
  try {
    const setNum = req.params.num;
    await legoData.deleteSet(setNum);
    res.redirect('/lego/sets');
  } catch (err) {
    console.error(err);
    const errorMessage = err.message || 'Unknown error occurred';
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${errorMessage}` });
  }
});

app.use(express.static('public'));




app.get("/login", (req, res) => {
  res.render("login",{errorMessage:null,userName:''});
});

app.get("/register", (req, res) => {
  res.render("register",{errorMessage:null,userName:'',successMessage:null});
});

app.post("/register", async (req, res) => {
  try {
    const userData = req.body;
    await authData.registerUser(userData);
    res.render("register", { successMessage: "User created" });
  } catch (err) {
    res.render("register", { errorMessage: err, userName: req.body.userName,successMessage:null });
  }
});

app.post("/login", async (req, res) => {
  try {
  
    req.body.userAgent = req.get("User-Agent");

    const user = await authData.checkUser(req.body);

    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    };

    res.redirect("/lego/sets");
  } catch (err) {
    const userName = req.body.userName || '';

    res.render("login", { errorMessage: err, userName: req.body.userName });
  }
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.use((req, res) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});


});