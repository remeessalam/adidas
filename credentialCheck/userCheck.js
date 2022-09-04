const userschema = require("../schemaModel/userschema")
const bcrypt = require('bcrypt')
const { resolve } = require("path")
const { CURSOR_FLAGS } = require("mongodb")
const { response } = require("../app")





module.exports={
    dosignUp:(userdata)=>{
        console.log('hai')
        let response ={
            founded : false
        }
        return new Promise(async(resolve,reject)=>{
            let user = await userschema.findOne({email:userdata.email})
            if(user){
                response.founded = true
                resolve(response)
            }else{
            userdata.password = await bcrypt.hash(userdata.password,10)
            let {fname,lname,email,password,mobilenumber,address}= userdata
            user = new userschema({
                fname,
                lname,
                email,
                password,
                mobilenumber,
                address,
            })
            user.save().then((data)=>{
            console.log(data+'datasaved')
            response = data
            resolve(response)
            })
        }
        }   
    )},
    dologin:(userdata)=>{
        console.log(userdata)
        let {email,password} =userdata
         
        return new Promise(async(resolve,reject)=>{
           let user = await userschema.findOne({email:email}).lean()
            let response={}
            if(user){
                
                console.log(userdata.password)
                console.log(user)

                
             let status=await bcrypt.compare(password,user.password).then((status)=>{
                if(status){
                    if(user.status ==="active"){
                        console.log('enter in if')
                        response.user=user
                        response.status=true
                        response.active = true
                        resolve(response)
                    }else{
                        response.status = true
                        response.active = false
                        resolve(response)
                    }
                   
                }else{
                    response.status=false
                    console.log('user not found')
                    resolve(response)
                }
             })
                      
            }else{
                response.status=false
                console.log('no userdata received')
                resolve(response)
            }
        })
    } 

}
