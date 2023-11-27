/********************************************************************************
* WEB322 – Assignment 05
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Pruthvi Patel Student ID: 170733216 Date: 24th November,2023
* Published URL: https://weak-pear-catfish-robe.cyclic.app/ 

********************************************************************************/


const express = require("express");
const app = express();
app.set('view engine', 'ejs');
const legoData = require("./modules/legoSets");
app.use(express.urlencoded({ extended: true }));


legoData.Initialize()
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


app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addSet', { themes });
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

  app.post('/lego/addSet', async (req, res) => {
    
      legoData.addSet(req.body)
      .then(()=> {
      res.redirect('/lego/sets');
      })
     .catch (err => {
      
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
    });
  });

app.get('/lego/editSet/:num', async (req, res) => {
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

app.post('/lego/editSet', async (req, res) => {
  try {
    const setNum = req.body.set_num;
    const setData = req.body;

    await legoData.editSet(setNum, setData);
    res.redirect('/lego/sets');
  } catch (err) {
  
    res.status(500).render('500', { message: `An error occurred: ${err.message}` });
  }
});

app.get('/lego/deleteSet/:num', async (req, res) => {
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


app.use((req, res) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});


});