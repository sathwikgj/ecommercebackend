const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
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

// Role-based separated route folders (same controller logic, organized by role)
app.use("/api/admin/users", require("./routes/admin/user.routes"));
app.use("/api/admin/orders", require("./routes/admin/order.routes"));
app.use("/api/admin/address", require("./routes/admin/address.routes"));
app.use("/api/admin/appointments", require("./routes/admin/appointment.routes"));

app.use("/api/user/users", require("./routes/user/user.routes"));
app.use("/api/user/orders", require("./routes/user/order.routes"));
app.use("/api/user/address", require("./routes/user/address.routes"));
app.use("/api/user/appointments", require("./routes/user/appointment.routes"));
app.use("/api/user/cart", require("./routes/user/cart.routes"));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});