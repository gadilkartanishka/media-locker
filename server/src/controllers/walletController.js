const pool = require("../db");

const getWallet = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await pool.query(
      "SELECT coins FROM users WHERE id = $1",
      [userId],
    );

    const transactionsResult = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );

    res.json({
      balance: userResult.rows[0].coins,
      transactions: transactionsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getWallet };
