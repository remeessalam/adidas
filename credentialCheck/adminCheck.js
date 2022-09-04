const { resolve } = require("path")
const adminlogin = require("../schemaModel/adminlogin")
const bcrypt = require('bcrypt')


module.exports={
    // dosignUp:(admindata)=>{
    //     // const admin = {username,password}
    //     console.log('hai')
    //     return new Promise(async(resolve,reject)=>{
    //         admindata.password = await bcrypt.hash(admindata.password,10)
    //         let {username,password}= admindata
    //         admin = new adminlogin({
    //             username,
    //             password
    //         })
    //         admin.save().then((data)=>{
    //         console.log(data+'datasaved')
    //         resolve(data)
    //         })
    //     }   
    // )},

    dologin:(admindata)=>{
        let{username,password}=admindata
return new Promise (async(resolve,reject)=>{
    let admin = await adminlogin.findOne({username})
    let response={}
     admin = await bcrypt.compare(password,admin.password)
    if (admin){
        response.admin=admin
        response.status=true
        resolve(response)
    }else{ 
        response.status=false
    }
})
        }
    }
