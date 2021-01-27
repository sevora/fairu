/*
 * Contributor Schema
 * defines all the data that 
 * a contributor has, its structure
 * and requirements.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contributorSchema = new Schema({
    // username is a String, that is required, unique, 
    // minimum length of 5 characters and maximum of 256
    // also whitespaces on the beginning or end are removed.
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 5,
        maxLength: 256
    },
    // default value is false, can only be set
    // by the superuser using special routes
    isAdmin: {
        type: Boolean,
        default: false
    },
    // default value is false, there is only one superuser
    // and it is the creator of the site
    isSuperUser: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Contributor = mongoose.model('Contributor', contributorSchema, 'contributors');
module.exports = Contributor;
