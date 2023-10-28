const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

/**************************************************************************************** 

Initialize():
The purpose of this function is to fill the "sets" array (declared above), by adding copies of all the setData
objects

*****************************************************************************************/

/*function Initialize()
{
    return new Promise((resolve,reject) => {

    
    sets = [];
    setData.forEach((obj) => {
        const theme = themeData.find(function(theme) {
            let isTrue = (theme.id === obj.theme_id);
            return isTrue;
        })

        if(theme)
        {
            obj.theme = obj.name;
            sets.push(obj);
        }
    });

    resolve();
});
    
}*/

function Initialize() {
    return new Promise((resolve, reject) => {
      sets = [];
      setData.forEach(function(set) {
        var theme = themeData.find(function(theme) {
          return theme.id === set.theme_id;
        });
        if (theme) {
          sets.push({ ...set, theme: theme.name });
        }
      });
      resolve(); 
    });
  }




/**************************************************************

getAllSets():
This function simply returns the complete "sets" array

****************************************************************/
function getAllSets()
{
    return new Promise((resolve,reject) => {
   if (sets.length > 0)
   {
    resolve(sets);
   } 
   else {
    reject("There were no sets to be found!!");
   }
});
}


/***************************************************************************************

getSetByNum(setNum):
This function will return a specific "set" object from the "sets" array, whose "set_num" 
value matches the value of the "setNum" parameter, ie: if getSetByNum("001-1") was invoked,
the following set object would be returned

***************************************************************************************/
function getSetByNum(setNum)
{
    return new Promise((resolve,reject) => {
    const obj = sets.find(function(set)
    {
        let isTrue = (set.set_num === setNum);
        return isTrue;
    })

    if (obj)
    {   
        resolve(obj);
    }
    else{
        reject(`There are no sets that have set number ${setNum} `);
    }
});
  
}

/**************************************************************************************** 

getSetsByTheme(theme):
The purpose of this function is to return an array of objects from the "sets" array whose 
"theme" value matches the "theme" parameter. However, it is important to note that the 
"theme" parameter may contain only part of the "theme" string, and case is ignored.

******************************************************************************************/

  function getSetsByTheme(theme) {
    return new Promise((resolve,reject) => {

    const themeInLowerCase = theme.toLowerCase();
    var listOfObjs = sets.filter(function(obj)
    {
        return obj.theme.toLowerCase().includes(themeInLowerCase);
    });  

    if (listOfObjs.length > 0) {
        resolve(listOfObjs);
    } else {
        reject(`There are no sets that have the theme "${theme}"`);
    }

    
});

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
};