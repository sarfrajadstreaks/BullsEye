const app=require('./app');
var port= process.env.PORT || '3000'
const server=app.listen(port, ()=>{
    console.log('Server started at:'+port);
})
module.exports=server;