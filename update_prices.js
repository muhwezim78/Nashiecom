const fs = require("fs");
const path = "./src/data/products.js";

let content = fs.readFileSync(path, "utf8");

// Update prices
content = content.replace(/price:\s*(\d+(\.\d+)?)/g, (match, p1) => {
  const newVal = Math.round((parseFloat(p1) * 3700) / 100) * 100; // Round to nearest 100
  return `price: ${newVal}`;
});

// Update original prices
content = content.replace(/originalPrice:\s*(\d+(\.\d+)?)/g, (match, p1) => {
  const newVal = Math.round((parseFloat(p1) * 3700) / 100) * 100;
  return `originalPrice: ${newVal}`;
});

fs.writeFileSync(path, content);
console.log("Prices updated");
