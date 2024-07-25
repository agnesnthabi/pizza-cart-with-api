document.addEventListener("alpine:init", () => {
  Alpine.data("pizzaCart", () => {
    return {
      pizzas: [],
      username: "agnesnthabi",
      cartPizzas: [],
      cartTotal: 0.0,
      paymentAmount: 0,
      message: "",
      featuredPizzas: [],
      historicalOrders: [],
      showHistoricalOrders: false,
      showHistoricalOrdersButton: false,
      showToast: false,
      toastMessage: "",
      title: 'Nayna Deep-Dish Pizza',
      cartId: '',
      cartId: localStorage.getItem('cartId') || '',
      isLoggedIn: localStorage.getItem('username') ? true : false,

      login() {
        if (this.username.length > 2) {
            localStorage.setItem('username', this.username); 
            this.createCart().then(() => {
                this.isLoggedIn = true;
                this.showCartData();
                this.featuredGet().then((res) => {
                    this.featuredPizzas = res.data.pizzas;
                });
            });
        } else {
            alert("Username is too short");
        }
      },

      logout() {
        if (confirm('Do you want to logout?')) {
            this.username = '';
            this.cartId = '';
            localStorage.removeItem('cartId'); 
            localStorage.removeItem('username'); 
            this.isLoggedIn = false;
        }
      },
      
     

      createCart() {
        const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
        return axios.get(createCartURL).then((result) => {
          this.cardId = result.data.cart_code;
        });
      },

      featuredGet() {
        const featuredURL = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.username}`;
        return axios.get(featuredURL);
      },

      getCart() {
        const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cardId}/get`;
        return axios.get(getCartURL);
      },

      showCartData() {
        this.getCart().then((result) => {
          const cartData = result.data;
          this.cartPizzas = cartData.pizzas;
          this.cartTotal = cartData.total.toFixed(2);
        });
      },

      addPizza(pizzaId) {
        return axios
          .post("https://pizza-api.projectcodex.net/api/pizza-cart/add", {
            cart_code: this.cardId,
            pizza_id: pizzaId,
          })
          .then(() => true)
          .catch((err) => {
            console.log(err);
          });
      },

      RemovePizza(pizzaId) {
        return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
            "cart_code": this.cardId,
            "pizza_id": pizzaId
        })
    },

      removePizzaFromCart(pizzaId) {
        this.RemovePizza(pizzaId).then(() => {
          this.showCartData();
        });
      },

      pay(amount) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/pay",
          {
            cart_code: this.cardId,
            amount,
          }
        );
      },

      init() {
        axios
          .get("https://pizza-api.projectcodex.net/api/pizzas")
          .then((result) => {
            this.pizzas = result.data.pizzas;
          });

        if (!this.cardId) {
          this.createCart().then(() => {
            this.showCartData();
          });
          this.featuredGet().then((res) => {
            this.featuredPizzas = res.data.pizzas;
          });
        }
      },

      addPizzaToCart(pizzaId) {
        console.log("Adding pizza to cart:", pizzaId);
        this.addPizza(pizzaId)
          .then(() => {
            console.log("Pizza added, updating cart data...");
            this.showCartData();
            this.showToastMessage("Pizza added to cart!");
          })
          .catch((error) => {
            console.error("Error in addPizzaToCart:", error);
          });
      },

      showToastMessage(message) {
        this.toastMessage = message;
        this.showToast = true;

        // Hide the toast after 3 seconds
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      },

      HistoricalCart() {
        let order = {
            pizzas: [...this.cartPizzas.map(pizza => ({
                flavour: pizza.flavour,
                price: pizza.price,
                qty: pizza.qty
            }))],
            total: parseFloat(this.cartTotal),
            date: new Date().toLocaleDateString()
        };
        this.historicalOrders.push(order);
    },

      payForCart() {
        this.pay(this.paymentAmount).then((result) => {
          if (result.data.status == "failure" && this.paymentAmount > 0) {
            this.message = result.data.message + " Sorry - Insufficient!";
            setTimeout(() => (this.message = ""), 4000);
          } else if (result.data.status == "success" && this.paymentAmount > this.cartTotal) {
            const change = this.paymentAmount - this.cartTotal;
            this.message = `Payment Successful! Your change is: R${change.toFixed(2)} Thank You For Yor Order!`;

            this.HistoricalCart();

            setTimeout(() => {
              this.message = "";
              this.cartPizzas = [];
              this.cartTotal = 0.0;
              this.cartId = "";
              this.paymentAmount = 0;
              this.createCart();
            }, 10000);
          } else if (result.data.status == "success" && this.paymentAmount === this.cartTotal) {
            this.message = "Payment received, Enjoy your Pizzas!";

            this.HistoricalCart();

            setTimeout(() => {
              this.message = "";
              this.cartPizzas = [];
              this.cartTotal = 0.0;
              this.cartId = "";
              this.paymentAmount = 0;
              this.createCart();
            }, 10000);
          } else if (result.data.status == "failure" && this.paymentAmount === 0) {
            this.message = "Sorry - You have to put an amount to pay!";
            setTimeout(() => (this.message = ""), 10000);
          } else if (this.paymentAmount === 0) {
            this.message = "Your cart is empty, add some items!";
            setTimeout(() => (this.message = ""), 10000);
          }

          this.showHistoricalOrdersButton = true;
        });
      },


      toggleFavorite(id) {
        const pizza = this.pizzas.find((p) => p.id === id);
        if (pizza) {
          pizza.isFavorite = !pizza.isFavorite;
        }
      },

      toggleHistoricalOrders() {
        this.showHistoricalOrders = !this.showHistoricalOrders;
      },
    };
  });
});
