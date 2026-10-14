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
    // brand slug, e.g. "cadbury" or one of our house labels
    brand:{type:String, default: ''},
    // inventory: made-to-order gifts (cakes, prints) don't track stock
    sku:{type:String, default: ''},
    trackStock:{type:Boolean, default: false},
    stock:{type:Number, default: 0},
    lowStock:{type:Number, default: 5},
    // what one unit costs us at the base price (private, used for profit)
    costPrice:{type:Number, default: 0},
    // from published customer reviews
    ratingAvg:{type:Number, default: 0},
    ratingCount:{type:Number, default: 0},
    date:{type:Number, required:true}

})

productSchema.index({category: 1, subCategory: 1});
productSchema.index({category: 1, price: 1});
productSchema.index({bestseller: 1, date: -1});
productSchema.index({brand: 1, date: -1});
productSchema.index({trackStock: 1, stock: 1});
productSchema.index({name: "text", description: "text"});

const productModel =mongoose.models.product || mongoose.model("giftproduct", productSchema);

export default productModel;