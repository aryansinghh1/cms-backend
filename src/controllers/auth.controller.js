const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,

    },
});

exports.sendOTP = async (req,res)=>{
    const {email} = req.body;

    const otp = otpGenerator.generate(6,{digits:true});
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({email, otp, expiresAt});

    await transporter.sendMail({
        to: email,
        subject: "Your OTP",
        text: `OTP is ${otp}`,
    });

    res.json({message: "OTP sent"});

}

exports.verifyOTP = async (req,res)=>{
    const {email ,otp} = req.body;

    const record = await OTP.findOne({email}).sort({createdAt:-1});
    if(!record) return res.status(400).json({message: "NO OTP"});

    if(record.expiresAt < new Date())
        return res.status(400).json({message: "OTP expired"});

    const match = await bcrypt.compare(otp, record.otp);
    if(!match) return res.status(400).json({message: "Invalid OTP"});

    await User.updateOne({email}, {isVerified: true});

    res.json({message: "Email verified"});
}

exports.signup = async (req,res)=>{
    const {email,password} = req.body;

    const user = await User.create({email, password});
    res.json(user);
};

exports.login = async (req,res) => {
    const {email,password} = req.body;

    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message: "User not found"});

    const match = await  bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({message: "Wrong password"});

    const token = jwt.sign({id: user._id},process.env.JWT_SECRET,{
        expiresIn: "7d",
    });

    res.json({token});
}

