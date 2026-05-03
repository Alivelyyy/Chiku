module.exports = function authMiddleware(config) {
  const apiKey = config.DASHBOARD?.API_KEY;

  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = authHeader.slice(7);
    if (!apiKey || token !== apiKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    next();
  };
};
