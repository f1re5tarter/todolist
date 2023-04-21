const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")
const mongo = require("mongodb")
const _ = require("lodash")


const app = express();



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
  


mongoose.connect('mongodb+srv://Maris_Istamov:Maris6507@cluster0.odbe5wf.mongodb.net/todolistDB', {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your TO-DO List"
})

const item2 = new Item({
  name: "Hit + to add new task"
})

const item3 = new Item({
  name: "<- Hit this to delete task"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)


app.get("/", function (req, res){
  
  Item.find({}).then((foundItems) =>{
    if (foundItems.length === 0){
      Item.insertMany(defaultItems).then(() =>{
        console.log("Inserted")
      }).catch((err) =>{
        console.log(err)
      })
      res.redirect("/")
    }else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
});    
  
app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName}).then((foundList) =>{
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save()
        res.redirect("/" + customListName)
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    })
    
    
});

app.post("/", function (req, res) {
  const itemName = req.body.task;
  const listName = req.body.list
  
  const item = new Item({
    name: itemName
  })
  
  if (listName == "Today"){
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name: listName}).then((foundList) =>{
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }
  
});

// app.get("/work", function(req, res){
//   res.render("list", {listTitle: "Work list", newListItems: workItems})
// })

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName
  
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(() =>{
      console.log("Removed")
    }).catch((err) =>{
      console.log(err)
    })
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then((foundList) =>{
      res.redirect("/" + listName)
    })
  }
  
 
  
})


app.post("/work", function(req, res){
  
  const task = req.body.task;
  workItems.push(task)
  res.redirect("/work")
})

app.get("/about", function(req, res){
    res.render("about")
})

app.listen(3000, function () {
  console.log("The server is running on port 3000");
});
