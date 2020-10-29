const express = require('express')
const app = express()
const port = 8080

// Serve web pages at localhost:8080/* and fill missing extensions with .html
app.use(express.static('src/web-pages', {extensions: ['html']}))
// Server scripts at localhost:8080/scripts and fill missing extensions with .js
app.use('/scripts', express.static('public/scripts', {extensions: ['js']}))
// Serve assets at localhost:8080/assets/*
app.use('/assets', express.static('public/assets'))
// Following is used for sourceMaps in chrome
app.use('/src/scripts', express.static('src/scripts'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
