const api = require('../services/api');
const axios = require('axios');
const mongoose = require('mongoose');
const GitInfoModel =  mongoose.model('GitInfo');

module.exports = {
    async getGitDataAPI(req,res){
        const login = req.params.user;
        const repo = req.params.repo;
        
        const localData = await GitInfoModel.findOne({'repository' : `${login}/${repo}`})
        switch (localData){
            case null : {
                getRemote();
                break;
            }
            default : {
                res.json(localData);
                break;
            }

        }

        async function getRemote(){
            const response = await api.get(`/repos/${login}/${repo}/git/trees/master?recursive=1`);
                
            let result = await Promise.all(response.data.tree.map(async d=>{
                let linesData
                let lines
                    
                try{
                    switch(d.type){
                        case "blob" : {
                            linesData = await axios.get(`https://raw.githubusercontent.com/${login}/${repo}/master/${d.path}`);
                            
                            if(d.path.includes('.json')){
                                lines = JSON.stringify(linesData.data, null, '\r').split('\n').length;
                            }else{
                                lines = linesData.data.split('\n').length -1; 
                            }
                            break;
                        }
                    }
                }catch(err){
                    //console.log(err);
                }

                const [,typeByExt] = d.path.split(/(\.[^.\\/:*?"<>|\r\n]+$)/);
                data = {
                    'path' : d.path,
                    'size' : d.size,
                    'type' : d.type,
                    'lines' : lines,
                    'extension' : typeByExt
                }
                
                return data;
            
            })).then(res => res.filter(value =>{
                return value.type === "blob"
            }));
        
            let groupeAdded = [];

            result.reduce(function(res, value) {
            if (!res[value.extension]) {
                res[value.extension] = { extension: value.extension, size: 0,lines : 0 };
                groupeAdded.push(res[value.extension])
            }
            res[value.extension].size += value.size;
            res[value.extension].lines += value.lines;
            return res;
            }, {});

            const payload = await GitInfoModel.create({
                "repository" : `${login}/${repo}`,
                "information" : groupeAdded})
            
            
            res.json(payload.information);
        }
    }
}