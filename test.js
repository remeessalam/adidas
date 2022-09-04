getTotalAmount: (userid) => {
    return new Promise(async (resolve, reject) => {
        Helper.getCartProducts(userid).then((res) => {
            let response = {};
            cart = res.cart;
            let total;
            if (cart) {
                if (cart.cartItems.length > 0) {
                    total = cart.cartItems.reduce((acc, curr) => {
                        acc += curr.product.Price * curr.quantity
                        return acc
                    }, 0)
                }


                let shipping = 0;
                if (total < 1000) {
                    shipping = 100;
                }
                response.shipping = shipping;
                response.total = total;
                response.grandtotal = response.total + response.shipping
                response.cart = cart
                resolve(response)
            } else {
                response.cartempty = true
                resolve(response)
            }
        })
    })
}