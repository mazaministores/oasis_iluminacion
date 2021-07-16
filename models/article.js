const {Schema,model}=require('mongoose')

const articleSchema=new Schema({
    brand:String, 
    model:String,
    price:Number,
    image:String,
    categorie:String
})


articleSchema.set('toJSON',{
    transform:(document,returnedObject)=>{
        returnedObject.id=returnedObject._id
        delete returnedObject._id
        delete returnedObject._v
    }
})

const Article=model('Article',articleSchema)

module.exports=Article