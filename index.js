'use strict'

var express = require("express")
var app = express()
var mongodb = require("mongodb")
var db
var urlRegex = /(^https?:\/\/)\S+\.+\S+/

mongodb.MongoClient.connect(process.env.MONGODB_URI, (err, database) => {
    if(err) {
        console.error(err)
        process.exit(1)
    }
    
    db = database;
    console.log("database connected")
    
    var server = app.listen(process.env.PORT, () => {
        var port = server.address().port
        console.log("listening on", port)
    })
})

app.get('/', (req, res) => {
    res.send('<h1>Put a url after the top level domain in the address bar to shorten it</h1>')
})

app.get('/*', (req, res) => {
    
    console.log(typeof req.url)
    var redirects = db.collection('redirects')
    
    var oldUrl = req.url.slice(1)
    console.log(oldUrl)
    
    if(urlRegex.test(oldUrl)) {
        var identifier = Math.floor(Math.random() * 1000000)
        
       var findIndex = function () { redirects.find({"identifier" : identifier}).toArray((err, array) => {
            if (array.length === 0) {
                 var newUrl = 'url-shorten-fcc-2016.herokuapp.com/' + identifier
        
                redirects.insertOne( {
                    "identifier" : identifier,
                    "redirect" : oldUrl
                }, (err, doc) => {
                    if (err)
                        console.error(err)
                    else 
                        res.send("Your new url is " + newUrl)
                })
            } else {
                findIndex();
            }
        })}
    
       findIndex();    
        
    } else if (Number(oldUrl)) {
        redirects.find( {identifier : Number(oldUrl)}).toArray((err, array) => {
            if(array.length > 0) 
                res.redirect(array[0].redirect)
            else
                res.send('not found')
        })
        
        
    } else {
        res.send("invalid entry")
    }
    
})
