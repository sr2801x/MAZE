const Stripe = require("stripe");

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

function getPricingCatalog() {
  // amount in smallest currency unit; default INR
  return [
    { id: "pack_10", name: "10 credits", credits: 10, amount: 9900, currency: "inr" },
    { id: "pack_20", name: "20 credits", credits: 20, amount: 17900, currency: "inr" },
    { id: "pack_50", name: "50 credits", credits: 50, amount: 39900, currency: "inr" }
  ];
}

module.exports = { getStripe, getPricingCatalog };

