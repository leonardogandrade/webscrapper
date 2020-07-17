const {_getData_,format} = require('./src/controllers/gitInfo');
const { replaceOne } = require('./src/models/gitInfoModel');
const mockAxios = require('axios');
        
const mockData = "\n\n\n\n\n<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n  <link rel=\"dns-prefetch\" href=\"https://github.githubassets.com\">\n  <link rel=\"dns-prefetch\" href=\"https://avatars0.githubusercontent.com\">\n  <link rel=\"dns-prefetch\" href=\"https://avatars1.githubusercontent.com\">\n  <link rel=\"dns-prefetch\" href=\"https://avatars2.githubusercontent.com\">\n  <link rel=\"dns-prefetch\" href=\"https://avatars3.githubusercontent.com\">\n  <link rel=\"dns-prefetch\" href=\"https://github-cloud.s3.amazonaws.com\">\n  <link rel=\"dns-prefetch\" href=\"https://user-images.githubusercontent.com/\">\n\n\n\n  <link crossorigin=\"anonymous\" media=\"all\" integrity=\"sha512-"

it('get data from github using axios http request',async () =>{
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({
        data : {
            mockData
        }
    }));
    const data =  await _getData_('/nknapp/line-counter');
    expect({data : mockData}).toEqual({data : mockData});
});

let formatedData = [];

it('test the format function to create a array of listed files',()=>{
    const rawDataMock = ["class=\"js-navigation-open link-gray-dark\" title=\".editorconfig\" id=\"1e70daafb475c0ce3fef7d2728279182-d5c7965d570f663029e2d9de1b3d8f4309f7bdcf\" href=\"/nknapp/line-counter/blob/master/.editorconfig\">.editorconfig</a>","class=\"js-navigation-open link-gray-dark\" title=\".gitattributes\" id=\"fc723d30b02a4cca7a534518111c1a66-660957e70cf2a2affa82417f757eb8d6fed0d23f\" href=\"/nknapp/line-counter/blob/master/.gitattributes\">.gitattributes</a>"]
    const blobMock = ["/nknapp/line-counter/blob/master/.editorconfig","/nknapp/line-counter/blob/master/.gitattributes"]
    
    formatedData = format(rawDataMock);
    expect(formatedData).toEqual(blobMock);
})