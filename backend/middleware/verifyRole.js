const { getSupabaseAdminClient } = require("../config/supabaseClient");

const verifyRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid authorization header" });
      }

      const token = authHeader.split(" ")[1];
      const supabase = getSupabaseAdminClient();
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: "Unauthorized session or invalid token" });
      }

      // Capture standard user data to req.user for down-stream handlers
      req.user = user;

      // Extract role
      const userRole = (user.app_metadata && user.app_metadata.role) || "consumer";
      const normalizedRoles = roles.map(r => r.toLowerCase());

      // Normalize 'household' -> 'consumer'
      const normalizedUserRole = userRole.toLowerCase() === 'household' ? 'consumer' : userRole.toLowerCase();

      if (!normalizedRoles.includes(normalizedUserRole)) {
        return res.status(403).json({ error: `Forbidden: requires one of the following roles: [${roles.join(", ")}]` });
      }

      next();
    } catch (err) {
      console.error("Error in verifyRole middleware:", err);
      return res.status(500).json({ error: "Internal server verification error" });
    }
  };
};

module.exports = verifyRole;
