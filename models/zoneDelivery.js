const {Schema,model}=require('mongoose')

const zoneDSchema=new Schema({
    addres:String, 
    price:Number,
})


zoneDSchema.set('toJSON',{
    transform:(document,returnedObject)=>{
        returnedObject.id=returnedObject._id
        delete returnedObject._id
        delete returnedObject._v
    }
})

const ZoneD=model('ZoneD',zoneDSchema)

module.exports=ZoneD