require('dotenv').config();
const Sequelize = require('sequelize');
const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];



const sequelize = new Sequelize(process.env.DB_DATABASE,process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });
// Define Theme and Set models
//THEME:-
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
}, { timestamps: false });

//SET:-
const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Theme,
      key: 'id',
    },
  },
  img_url: Sequelize.STRING,
}, { timestamps: false });

Set.belongsTo(Theme, { foreignKey: 'theme_id' });


 ////////////////////////////////////////////////////////////////////////////////////
function Initialize() {
    return sequelize.sync()
        .then(() => {
            console.log('Database synchronized successfully.');
        })
        .catch((err) => {
            console.log('Unable to synchronize the database:', err);
            throw err; 
        });
}





/**************************************************************

getAllSets():
This function simply returns the complete "sets" array

****************************************************************/
function getAllSets() {
  return Set.findAll({ include: [Theme] })
      .then((sets) => {
          return sets;
      })
      .catch((error) => {
          throw error;
      });
}



/***************************************************************************************

getSetByNum(setNum):
This function will return a specific "set" object from the "sets" array, whose "set_num" 
value matches the value of the "setNum" parameter, ie: if getSetByNum("001-1") was invoked,
the following set object would be returned

***************************************************************************************/
function getSetByNum(setNum) {
  return Set.findOne({
      include: [Theme],
      where: {
          set_num: setNum
      }
  })
      .then((set) => {
          if (set) {
              return set;
          }
          throw new Error(`Unable to find the requested set with set number ${setNum}`);
      })
      .catch((error) => {
          throw error;
      });
}


/**************************************************************************************** 

getSetsByTheme(theme):
The purpose of this function is to return an array of objects from the "sets" array whose 
"theme" value matches the "theme" parameter. However, it is important to note that the 
"theme" parameter may contain only part of the "theme" string, and case is ignored.

******************************************************************************************/

function getSetsByTheme(theme) {
  return Set.findAll({
      include: [Theme],
      where: {
          '$Theme.name$': {
              [Sequelize.Op.iLike]: `%${theme}%`
          }
      }
  })
      .then((sets) => {
          if (sets.length > 0) {
              return sets;
          }
          throw new Error(`Unable to find requested sets with the theme "${theme}"`);
      })
      .catch((error) => {
          throw error;
      });
}

async function addSet(setData) {
  try {
    await Set.create(setData);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err.message || 'Unknown error occurred');
  }
}

async function getAllThemes() {
  try {
    const themes = await Theme.findAll();
    return Promise.resolve(themes);
  } catch (err) {
    return Promise.reject(err.message || 'Unknown error occurred');
  }
}

async function editSet(setNum, setData) {
  try {
    const set = await Set.findOne({
      where: {
        set_num: setNum,
      },
    });

    if (!set) {
      throw new Error(`Set with set_num ${setNum} not found`);
    }

    await set.update(setData);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err.message || 'Unknown error occurred');
  }
}

// deleteSet function
async function deleteSet(set_num) {
  try {
    const result = await Set.destroy({
      where: {
        set_num: set_num,
      },
    });
    if (result === 0) {
      throw new Error(`Set with set_num ${set_num} not found.`);
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err.message || 'Unknown error occurred');
  }
}


/*************************************************************************************** *  
                                TEST CODE     
                                                       
  //Initialize function
console.log("Testing Initialize function...");
Initialize();
console.log("Sets array after initialization:");
console.log(getAllSets());

//getSetByNum function
console.log("\nTesting getSetByNum function...");
const setNum = "001-1";
const foundSet = getSetByNum(setNum);
console.log(`Set with set_num ${setNum}:`);
console.log(foundSet);

//getSetsByTheme function
console.log("\nTesting getSetsByTheme function...");
const theme = "Hinges"; 
const setsByTheme = getSetsByTheme(theme);
console.log(`Sets with the theme containing "${theme}":`);
console.log(setsByTheme);
******************************************************************************************/

// Export the functions as a module
module.exports = {
    Initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    Theme,
    Set,
    addSet,
    getAllThemes,
    editSet,
    deleteSet,
};