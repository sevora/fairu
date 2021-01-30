/*
 * File Schema
 * Defines everything that a file should 
 * have.
 */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    // filename is of String type, required, and should be unique,
    // minimum length is 5 characters and maximum is 256
    filename: {
        type: String,
        required: [true, 'Filename is required.'],
        unique: true,
        uniqueCaseInsensitive: true,
        trim: true,
        minLength: [5, 'Filename is too short.'],
        maxLength: [256, 'Filename too long.']
    },
    // the description is a short text
    // of 400 characters max and is optional
    description: {
        type: String,
        required: false,
        unique: false,
        trim: true,
        maxLength: [400, 'Description must not exceed 400 characters']
    },
    // tags is an array of keywords mainly used for searching,
    // optional only. Restricted to tags of at least 2 characters 
    // and 50 maximum characters per tag. A file can also only have 
    // 256 maximum tags
    tags: {
        type: Array,
        required: false,
        validate: [ validateTags, 'Each tag must have minimum of 2 characters and maximum of 50 characters. There can also only be 200 maximum tags.' ]
    },
    // filetype that is from a limited
    // set, is only valid in enum
    filetype: {
        type: String,
        required: [true, 'Filetype is required.'],
        enum: [ 'pdf', 'doc', 'pptx', 'xlsx', 'odf', 'epub', 'zip', 'others' ]
    },
    // downloadURLs is an array of urls meant for downloading files.
    // Restricted to 12 URLs and minimum length of 5 characters and maximum of 1000 characters
    downloadURLs: {
        type: Array,
        required: true,
        validate: [ validateDownloadURLs, 'URL does not look proper.']
    }, 
    // uploaderID is set server-side not client-side through secure
    // authentication processes, this is to restrict manipulation of uploaderID
    uploaderID: {
        type: String,
        required: true,
        unique: false
    },
    // verified is a Boolean, unverified files are default not shown to users
    // whereas verified files are proper files with proper fields and content
    // shown to the user by default
    verified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: String
    }
}, { timestamps: true });

// validation for array of download urls
function validateDownloadURLs(array) {
    let validArrayLength = array.length >= 1 && array.length <= 12;
    let URLsLength = array.every(url => typeof url == "string" && url.length >= 5 && url.length <= 1000);
    let URLsRegEx = array.every(url =>  /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(url));
    return validArrayLength && URLsLength && URLsRegEx;
}

// validation for array of tags
function validateTags(array) {
    let validArrayElements = array.every(tag => typeof tag == "string" && tag.length >= 2 && tag.length <= 50);
    return validArrayElements && array.length <= 256;
}

fileSchema.plugin(uniqueValidator, { message: '{PATH} is already taken.' });
const File = mongoose.model('File', fileSchema, 'files');
module.exports = File;
