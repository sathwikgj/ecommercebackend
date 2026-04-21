require("dotenv").config(); 
const port = process.env.PORT || 3000;

const express = require("express");
const app = express();

app.use(express.json());
const cors = require("cors");
app.use(cors());


app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/coupons", require("./routes/coupon.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/address", require("./routes/address.routes"));
app.use("/api/cart", require("./routes/cart.routes")); 

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});