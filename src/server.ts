import  Express  from "express";
const app = Express()
app.post('/api/users', (req,res) =>{
     res.json('Fuck')
})

app.listen(8080, ()=>{console.log('Started servesr')})