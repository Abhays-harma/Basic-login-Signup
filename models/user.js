const mongoose=require('mongoose');
mongoose.connect("mongodb://localhost/MiniProject");

const userSchema=mongoose.Schema({
    username:String,
    name:String,
    age:Number,
    password:String,
    email:String,
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post"
        }
    ]
})

module.exports=mongoose.model("user",userSchema);