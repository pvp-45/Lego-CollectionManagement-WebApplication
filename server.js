/********************************************************************************
* WEB322 – Assignment 03
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Pruthvi Patel Student ID: 170733216 Date: 24th October,2023
*
********************************************************************************/


const express = require("express");
const app = express();
const legoData = require("./modules/legoSets");

// Initialize the Lego data and start the server when data is ready
legoData.Initialize()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Error initializing Lego Data:", error);
  });

// Route to the "Home" page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/home.html");
});

// Route to the "About" page
app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/views/about.html"); // Update to the correct path for your about.html file
});


//Route responsible for responding with all of the Lego sets from the legoData module
app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if(theme)
  {
    legoData.getSetsByTheme(theme)
    .then((sets) => {
      res.json(sets);
    })
    .catch((error) => {
      res.status(404).send(error);
    });
  }
  else{
  legoData.getAllSets()
    .then((objs) => {
      res.json(objs);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
  }
});


// Route to demonstrate getSetByNum functionality
//updated the function to use the params property to read the values of Route Parameters
app.get("/lego/sets/:numDemo", (req, res) => {
  let setNum = req.params.numDemo;
  legoData.getSetByNum(setNum)
    .then((obj) => {
      res.json(obj);
    })
    .catch((error) => {
      res.status(404).send(error);
    });
});




app.use(express.static('public'));

// Custom 404 page handling
app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/views/404.html");
});