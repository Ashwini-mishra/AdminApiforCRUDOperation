require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const User = require("./module/User");
const Categories = require('./module/Categories');
const Product = require('./module/Product');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// middleware to authenticate the user
const authenticate=async(req , res, next)=>{
    try{
        const decoded = await jwt.verify(
            // requesting the token from the header to authenticate
            req.headers.authorization,
            process.env.JWT_SECRET_KEY
        );
        // console.log("----------decoded :",decoded);
      
        if (decoded) {
            const data = await User.findOne({_id:decoded.id});
            // console.log(data);
            if(data.role === 2)
            {
                next();
            }else{
                res.send("only admin have the permission to access");
            }
        }else{
            return res.send("Unauthenticated User");
        }
        
      } catch (err) {
        //   console.log(err)
        return res.send(err.message);
      }
}


// token
const generateAccessToken = (id) => {
    return jwt.sign({ id }, `${process.env.JWT_SECRET_KEY}`);
  };

// register user
app.post("/register",async(req,res)=>{
    const {name , pass , email} = req.body;
     if(name !== "" && email !== "" && pass !== "")
     {
         const data =await new User({name:name , email: email , pass:pass });
         data.save();
         res.send(data);
     }else{
         res.send("not register");
     }
})


// login User
app.post("/login" , async (req,res)=>{
    const {email , pass} = req.body;
     const data = await User.findOne({email});
    //  const id= data._id;
    //  console.log(data);
     if(data)
     {
         const token = await generateAccessToken(data._id);
         res.send(token);
     }else{
         res.send("Un authenticated User");
     }
})


// add fields categorise
app.post("/addCategorise",authenticate,async (req,res)=>{
    const { c_name } = req.body;
    if(c_name !=="")
    {
        const data = await Categories({c_name:c_name});
        data.save();
        res.json(data);
    }else{
        res.send("not added");
    }
})

// add productes according to categories
app.post("/addProductes",authenticate, async(req, res)=>{
    const {p_name , price , categories ,description , image, color , size} = req.body;
    if(categories !== "")
    {
        const data = await Product({p_name:p_name ,price: price ,categories: categories ,description:description , image:image,color: color ,size: size});
        data.save();
        res.json(data);
    }else{
        res.send("product can not listed")
    }
})

// search & view by categories id
app.get("/search", async(req, res)=>{
    const {id} = req.body;
    if(id !=="")
    {
        const data= await Product.find({categories:id});    
        res.json(data);
    }else{
        res.send("item not matched");
    }
})

// update the items
app.post("/updateItems",authenticate , async(req, res)=>{
    const {p_name , price , categories ,description , image, color , size} = req.body;
    if(p_name !== "")
    {
        const data= await Product.updateOne({categories:categories},{$set:{p_name:p_name ,price: price ,categories: categories ,description:description , image:image,color: color ,size: size}});    
        res.json(data);
    }else{
        res.send("item not matched");
    }
})


// delete items
app.post("/deleteItems", authenticate ,async(req, res)=>{
    const {id} = req.body;
    if(id)
    {
        const data = await Product.deleteOne({_id:id});
        res.send("sucessfully deleted"); 
    }else{
        res.send("not found");
    }
})

// port running status
app.listen(8000 ,()=>{console.log("port is running on port 8000")});