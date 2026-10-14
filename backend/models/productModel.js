import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    price:{type:Number, required:true},
    image:{type:Array, required:true},
    category:{type:String, required:true},
    subCategory:{type:String, required:true},
    sizes:{type:Array, required:true},
    bestseller:{type:Boolean},
    customization:{type:Object},
    // optional price per size, e.g. { "1kg": 22, "2kg": 40 }
    sizePrices:{type:Object},
    // who the gift suits: kids, teens, her, him, couples, elders, baby
    recipients:{type:[String], default: []},
    date:{type:Number, required:true}

})

productSchema.index({category: 1, subCategory: 1});
productSchema.index({category: 1, price: 1});
productSchema.index({bestseller: 1, date: -1});
productSchema.index({name: "text", description: "text"});

const productModel =mongoose.models.product || mongoose.model("giftproduct", productSchema);

export default productModel;