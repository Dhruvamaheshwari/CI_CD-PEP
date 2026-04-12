const expres = require('express')
const app = expres();


app.get('/' , (req ,res) => {
    res.send("hello jee kya haal h");
})

const PORT = 5000;

app.listen(PORT , ()=>console.log('server is started at port 5000'))