import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireAuth(req, res, supabase))) return;

  const { invoiceId, amount, paymentDate, method, note } = req.body || {};
  if (!invoiceId || !amount || !paymentDate) {
    return res.status(400).json({ error: "invoiceId, amount and paymentDate are required" });
  }
  const id = "pay_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const { data, error } = await supabase.rpc("record_payment", {
    p_id: id, p_invoice_id: invoiceId, p_amount: amount, p_payment_date: paymentDate,
    p_method: method || "", p_note: note || ""
  });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}
