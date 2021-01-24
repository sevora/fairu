const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contributorSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5
    }
}, { timestamps: true });

const Contributor = mongoose.model('Contributor', contributorSchema, 'contributors');
module.exports = Contributor;
