const express = require('express')
const EmailAddress = require("./index")
const app = express()

app.get('/', (req, res) => {
    EmailAddress.info(req.query.email).then( (info) => {
        res.json(info)
    })
})
app.listen(3000, () => console.log("EmailAddress service available on http://localhost:3000"))