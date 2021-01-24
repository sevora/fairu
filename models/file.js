const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    filename: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 5,
        maxLength: 60
    },
    description: {
        type: String,
        required: false,
        unique: false,
        trim: true,
        maxLength: 280
    },
    tags: {
        type: Array,
        required: false,
        validate: [ validateTags ]
    },
    filetype: {
        type: String,
        required: true,
        enum: [ "pdf", "doc", "pptx", "xlsx", "odf", "epub", "zip", "others" ]
    },
    downloadURLs: {
        type: Array,
        required: true,
        validate: [ validateDownloadURLs, '{PATH} does not meet requirements.']
    }, 
    uploaderID: {
        type: String,
        required: true,
        unique: false
    }
}, { timestamps: true });

function validateDownloadURLs(array) {
    let validArrayLength = array.length >= 1 && array.length <= 10;
    let validArrayElements = array.every(url => typeof url == "string" && url.length > 5 && url.length <= 1000);
    return validArrayLength && validArrayElements;
}

function validateTags(array) {
    let validArrayElements = array.every(tag => typeof tag == "string" && tag.length > 5 && tag.length <= 20);
    return validArrayElements;
}

const File = mongoose.model('File', fileSchema, 'files');
module.exports = File;
