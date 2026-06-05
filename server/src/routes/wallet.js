const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const { getWallet } = require("../controllers/walletController");

router.get("/", authenticate, getWallet);

module.exports = router;
