const express = require("express");
const searchController = require("../controllers/search.controller");
const cache = require("../middleware/cache");

const router = express.Router();

router.get("/", cache(60), searchController.globalSearch);

module.exports = router;
