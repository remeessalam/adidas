const { populate } = require('../schemaModel/banner')
const banner = require('../schemaModel/banner')



module.exports = {
    addbanner : (details)=>{
        return new Promise ((resolve,reject)=>{
      
            banners = new banner({
                heading : details.heading,
                about : details.about,
                product : details.product
            })
            banners.save().then((data)=>{
                console.log(data)
                resolve(data)
            })  
        }) 
    },
    getbanner : ()=>{
        return new Promise((resolve,reject)=>{
            banner.find().populate('product').lean().then ((data)=>{
                resolve(data)
            })
        })
    },
    deletebanner : (banid)=>{
        return new Promise((resolve,reject)=>{
            banner.findByIdAndDelete(banid).then((data)=>{
                console.log('banner deleted')
                resolve(data)
            })
        })
    },
    editbanner : (banid,bandetails)=>{
        return new Promise((resolve,reject)=>{
            banner.findByIdAndUpdate(banid,bandetails).then((data)=>{
                resolve(data)
                console.log('updated banner')
            })
        })
    }  
}
