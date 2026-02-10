const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const otpSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    expiresAt: Date,
  },
  { timestamps: true },
);

otpSchema.pre("save", async function () {
  if (!this.isModified("otp")) return;
  this.otp = await bcrypt.hash(this.otp, 10);
});

module.exports = mongoose.model("OTP",otpSchema);