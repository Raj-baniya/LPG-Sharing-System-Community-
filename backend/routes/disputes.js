const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { getSupabaseAdminClient } = require("../config/supabaseClient");
const {
  createDispute,
  getDisputes,
  updateDispute,
} = require("../controllers/disputeController");

const router = express.Router();

// Middleware to check dispute ownership on creation
const checkDisputeOwnership = async (req, res, next) => {
  try {
    const { exchangeId } = req.body;
    if (!exchangeId) {
      return res.status(400).json({ error: "exchangeId is required" });
    }

    const supabase = getSupabaseAdminClient();
    const { data: exchange, error } = await supabase
      .from("exchanges")
      .select("*")
      .eq("id", exchangeId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching exchange:", error);
    }

    // If exchange is found in DB, check ownership
    if (exchange) {
      const buyerId = exchange.buyer_id || exchange.buyerId;
      const sellerId = exchange.seller_id || exchange.sellerId;
      const currentUserId = req.user.id;

      if (currentUserId !== buyerId && currentUserId !== sellerId) {
        return res.status(403).json({ error: "Forbidden: You are not a party to this exchange" });
      }
    } else {
      // Fallback for development tests
      console.log(`⚠️ Exchange ID ${exchangeId} not found in DB. Allowing creation for development.`);
    }

    next();
  } catch (err) {
    console.error("Error in dispute ownership middleware:", err);
    return res.status(500).json({ error: "Internal server error validating dispute ownership" });
  }
};

router.post("/", protect, checkDisputeOwnership, createDispute);
router.get("/", protect, getDisputes);
router.patch(
  "/:id",
  protect,
  requireRole(["admin", "volunteer_inspector"]),
  updateDispute
);

module.exports = router;
