import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";

export default async function handler(req, res) {
  if (!(await requireAuth(req, res, supabase))) return;

  if (req.method === "GET") {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ error: "clientId is required" });
    const { data, error } = await supabase.rpc("get_quotes_for_client", { p_client_id: clientId });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { clientId, issuedDate, validUntil, servicesDescription, lineItems, subtotal, vatRate, vatAmount, total, notes } = req.body || {};
    if (!clientId || !issuedDate || !validUntil || !lineItems?.length) {
      return res.status(400).json({ error: "clientId, issuedDate, validUntil and at least one line item are required" });
    }
    const id = "q_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const { data, error } = await supabase.rpc("create_quote", {
      p_id: id, p_client_id: clientId, p_issued_date: issuedDate, p_valid_until: validUntil,
      p_services_description: servicesDescription || "", p_line_items: lineItems,
      p_subtotal: subtotal, p_vat_rate: vatRate, p_vat_amount: vatAmount, p_total: total,
      p_notes: notes || ""
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: "id and status are required" });
    const { data, error } = await supabase.rpc("update_quote_status", { p_id: id, p_status: status });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: "Method not allowed" });
}
