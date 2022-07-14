import mongoose from 'mongoose';


const schema = new mongoose.Schema({
    user: String,
    name: String,
    code: String,
    imageURL: String
})

export default mongoose.model('crosshairs', schema);