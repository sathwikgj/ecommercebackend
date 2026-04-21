const buckets = new Map();

const getClientKey = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const rateLimit = ({ windowMs, max, message }) => {
  return (req, res, next) => {
    const routeKey = req.baseUrl + req.path;
    const key = `${routeKey}:${getClientKey(req)}`;
    const now = Date.now();

    const current = buckets.get(key);
    if (!current || now > current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return res.status(429).json({
        message: message || "Too many requests. Please try again later.",
      });
    }

    current.count += 1;
    buckets.set(key, current);
    return next();
  };
};

module.exports = { rateLimit };
