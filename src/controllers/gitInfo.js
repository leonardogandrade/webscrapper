const axios = require('axios');
const mongoose = require('mongoose');
const {GitInfoSchema} = require('../models/gitInfoModel');
const GitInfoModel =  mongoose.model('GitInfo',GitInfoSchema);
const path = require('path');

let trees = []
let blob = []

async function getData(url,regex){
    try{
        const response = await axios.get(`https://github.com${url}`);
        let rawData = response.data.match(regex);
        return rawData
    }catch(err){
        throw(err)
    }
}

async function _getData_(url){
        const response = await axios.get(`https://github.com/nknapp/line-counter`);
        return response.data;
}

const format = (array) =>{
    let data =[];

    data =  array.map(value =>{
        return value.match(/href\=\"(.*?)\"\>/igm)[0].replace(/href\=\"/,"").replace(/">/,"");
    });

    trees = data.filter(value=>{
        return value.toString().match(/tree/igm)
    })

    const blob_ = data.filter(value=>{
        return value.toString().match(/blob/igm)
    })
    
    return blob_
}

function instructions(req,res){
    res.sendFile(path.join(__dirname,'../','../','/index.html'));
}

async function getGitData(req,res){
    const repo = req.params.repo;
    const user = req.params.user;
    
    const response = await GitInfoModel.findOne({"repository" : `${user}/${repo}`});
    
    if(response != null){
        res.json(response.information);
    }else{
        //This two variables were created to get data using REGEX
        const regexRaw = /class\=\"js\-navigation\-open link\-gray\-dark\"(.*?)\<\/a\>/igm;
        const regexInfo = /\d* lines|\d*\.?\d* Bytes|\d*\.?\d* KB/g;
        
        //This is the initialization, that is, the first page of github repository
        let rawData;
        rawData = await getData(`/${user}/${repo}`,regexRaw);
        
        //Here is the array of blobs, that is, only the files excluding the folders
        blob = format(rawData);
        let blobAux = [];
        
        //For each folder found in the first get data, sweep for each one of them and looking for files
        while(trees.length != 0){
            if(trees.length != 0 ){
                await Promise.all(trees.map(async value=>{
                    let data_ = await getData(value,regexRaw);
                    return  format(data_)
                })).then(res=>{
                    blobAux.push(res.toString().split(','));
                    return res
                })  
            }        
        }
        //The complete list of all files of all folders in a certain github repository
        let files = blob.concat(blobAux).toString().split(',');
    
        //With the complete list of all files, get the information about lines and size on its own page
        let info = await Promise.all(files.map(async file=>{
            const [,ext] = file.split('.')
            const _info_ = await getData(file,regexInfo);
            
            let [value,unit] = _info_[1].split(' ');
            switch(unit){
                case 'KB' :{
                    value = value * 1000
                }
            }
            
            const _data_ = {
                'path': file, 
                'size' : parseFloat(value), 
                'lines' : parseFloat(_info_[0].replace(/\slines/,"")), 
                'extension' : ext
            }
            return  _data_
        })).then(result=>{
            return result;
        })

        //Now use reduce function to group files by file extension and present the 
        //accumulated value of size and lines
        let groupeAdded = [];

        info.reduce(function(res, value) {
        if (!res[value.extension]) {
            res[value.extension] = { extension: value.extension, size: 0,lines : 0 };
            groupeAdded.push(res[value.extension])
        }
        res[value.extension].size += value.size;
        res[value.extension].lines += value.lines;
        return res;
        }, {});

        const {information} = await GitInfoModel.create({
            "repository" : `${user}/${repo}`,
            "information" : groupeAdded});

        res.json(information);
    }
}

module.exports ={
    getData,format,instructions,getGitData,_getData_
}