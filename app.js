const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const Date = require(__dirname + "/date.js"); // Date is bounded by the exports from the date.js file

// var DATE = Date.getdate();//note the parenthises as, because its function being got.
var GREET = Date.greet();



// Note the parenthesis ,as the Date is equalised to a fucntion ,we need to call it.


const app = express();//creating the app object.


app.set('view engine', 'ejs');//setting it for ejs.
app.use(bodyParser.urlencoded({ extended: true })); //for getting the value from the form.
app.use(express.static("public")); //for loading static files like css, js we need this.


//connecting to the mongodb database todolistDB,if it doesnot exist,it will be created.
// mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://harshjha:sohansunita@cluster0.xc2usiv.mongodb.net/todolistDB", { useNewUrlParser: true });



//ITEM SCHEMA ..................................................
//this is the process of creating a schema of any collection
const itemsschema = {
    name: String
};
//creating the model for the given itemschema .

const Item = mongoose.model("item", itemsschema);
//using the Item model .

const item1 = new Item({
    name: "Welcome"
});


const Defaultitems = [item1];
//ITEM SCHEMA ..................................................





//LIST SCHEMA....................................................
//now We are creating another schema for a collection List.
const listsschema = {
    name: {type:String,unique:true} ,
    items: [itemsschema]//vvi items is an array which will have eloemnts with document type Item.
}
//creating the model List ,for the collection  named List.
const List = mongoose.model("List", listsschema);

//LIST SCHEMA....................................................




//POST METHOD FOR (/)............................................
// making post request  from the home route
//the post to home route is for the entry of new tasks.

app.post("/", function (req, res) {

    // console.log(req.body); this will containn info related to the type of req

    const itemname = req.body.newitem;//name of the new item .
    const listname = req.body.list;//the name of the list in which it is gonna be inserted.

    //again creating the Newitem using the model Item,which follows itemsschema.
    const Newitem = new Item({
        name: itemname
    });


    //now things are divided into two parts if the post request is from home route 
    //or from any custom route


    //if it is from home route
    if (listname === "Today") {
        // console.log("reaching correct place");
        Newitem.save();
        res.redirect("/");
    }


    //else it is from any  different custom route.
    else {
        List.findOne({ name: listname }, function (err, foundList) {
            foundList.items.push(Newitem);
            foundList.save();
            //after adding the value into the custom route ,redirect it to the respective route to render.
            res.redirect("/" + listname);
        })

    }

})
//POST METHOD FOR (/)  ............................................


//POST METHOD FOR /delete..........................................
//this is a bit complex as we need to delete any task from  any of the list.

app.post("/delete", function (req, res) {
    // console.log(req.body);
    const removeitem = req.body.checkbox;
    const listname = req.body.listName;
    if (listname === "Today") {
        Item.findByIdAndRemove(removeitem, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect("/");
                // console.log("item removed succesfully");
            }
        });

    }

    else {

        List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: removeitem } } }, function (err, founditems) {
            if (!err) {
                res.redirect("/" + listname);
            }


        })

    }



})
//POST METHOD FOR /delete    end ......................................

//POST METHOD FOR   /newlist...............................
app.post("/newlist", function (req, res) {
    const newlistname = req.body.listname;
    res.redirect("/" +newlistname);

})



//GET REQUEST FOR HOME(/) ROUTE..............................................

//making get request for home route.
app.get("/", function (req, res) {
    // console.log(listcollections);
    //as its {} it will fetch us the whole document as an array in the callback function.

    Item.find({}, function (err, foundItems) {
        // console.log("founditems from / get method");
        // console.log(foundItems);
        if (foundItems.length === 0) {
            //If there is no entry it will enter the default items.
            Item.insertMany(Defaultitems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    // console.log("successfully inserted");
                }
            });
            res.redirect("/");
            //after redirecting it back to home route  it will move into else condition next time.
        }

        else {

            List.find({}, function (err, foundlist) {
                // var listcollections=foundlist;
                // console.log(foundlist.length);

                //small change to remove error.
               if (foundlist.length ==0){
                const tomorrowlist = new List({
                    name: "Tomorrow",//asits the name of the list.
                    items: Defaultitems//to have some default values already entered.
                })
                tomorrowlist.save();
               }
              //small change to remove error.

                let uniquefoundlist= [];
                foundlist.forEach((c) => {
                    if (!uniquefoundlist.includes(c)) {
                        uniquefoundlist.push(c);
                    }
                });

               console.log(uniquefoundlist);
               
            //   if(uniquefoundlist.length>4){
            //    uniquefoundlist = uniquefoundlist.slice(0, 3);
            //   }

                res.render("list", {
                    listtitle: "Today", newlistitems: foundItems, Lists: uniquefoundlist
                });
            })

            //this is solely dedicated for the home route hence we have listtitle as today


        }

    })


});
//GET REQUEST FOR HOME(/) ROUTE end ..............................................




//GET REQUEST FOR CUSTOM ROUTES...............................................

//express helps you to generate dynamic routes.here is the syntax
//customlistname will be acting as kind of variable for this get method

app.get("/:customlistname", function (req, res) {
    //getting the name of list or route in
    //the variable named Listname
    //the req will help you know from which route the cal has been given.
    const CustomListname = _.capitalize(req.params.customlistname);//(_. is a lodash functionality,see lodash docx)

    if (CustomListname != "Favicon.ico") {


        List.findOne({ name: CustomListname }, function (err, foundlist) {

            // console.log(listcollections);
            if (!err) {

                //if (!foundlist)condition is checking if list with that name is already present or not.
                //if its not returning that means that we need to create such a list.

                if (!foundlist) {
                    // console.log("Does not exists");

                    //creating a new data for list collection using List model.

                    const list = new List({
                        name: CustomListname,//asits the name of the list.
                        items: Defaultitems//to have some default values already entered.
                    })
                    list.save();
                    //very important as it seperately render each list into its own route.

                    res.redirect("/" + CustomListname);

                    //after this redirection the call will simply reach to the below else statement

                }
                else {
                    // console.log("Exists");
                    List.find({}, function (err, foundlistincustom) {
                        // var listcollections=foundlist;
                        // console.log(foundlistincustom.length);
                       

                        let uniquefoundlistincustom= [];
                        foundlistincustom.forEach((c) => {
                            if (!uniquefoundlistincustom.includes(c)) {
                                uniquefoundlistincustom.push(c);
                            }
                        });

                    console.log(foundlistincustom);
                    // if(uniquefoundlistincustom.length>4){
                    //     uniquefoundlistincustom = uniquefoundlistincustom.slice(0, 3);
                    //    }
         
                   let flag=0;
                 
                        res.render("list", { listtitle: CustomListname, newlistitems: foundlist.items, Lists: uniquefoundlistincustom });

                    })
                   

                    //if we already have a list with the requested name then simple render it



                    //as the foundlist is a kind of object with two keys named name and items.
                    //we are interested in items because we have already grabbed name via Listname.
                }
            }

        })
    }


})
//GET REQUEST FOR CUSTOM ROUTES end ...............................................





app.listen(process.env.PORT || 3000, function () {
    console.log("The local server is been set to port 3000");
})

