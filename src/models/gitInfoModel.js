const mongoose = require('mongoose');

const GitInfoSchema = mongoose.Schema({
    repository : String,
    information : [],
},{timestamps : true});

module.exports = mongoose.model('GitInfo',GitInfoSchema);