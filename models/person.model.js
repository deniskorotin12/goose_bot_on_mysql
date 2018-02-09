const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PersonSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Surname: {
        type: String,
        required: false
    },
    Identificator: {
        type: Number,
        required: true
    },
    Counter_Goose: {
        type: Number,
        required: true,
        default: 0
    },
    Group_id: {
        type: Number,
        required: true
    }
})

mongoose.model('person', PersonSchema)