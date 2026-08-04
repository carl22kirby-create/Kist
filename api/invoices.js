import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";

export default async function handler(req, res) {
  if (!(await requireAuth(req, res, supabase))) return;

  if (req.method === "GET") {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ error: "clientId is required" });
    const { data, error } = await supabase.rpc("get_invoices_for_client", { p_client_id: clientId });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { fromQuoteId, dueDate, discountAmount, discountReason, notes, clientId, servicesDescription, lineItems, subtotal, vatRate } = req.body || {};
    if (!dueDate) return res.status(400).json({ error: "dueDate is required" });
    const id = "inv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

    if (fromQuoteId) {
      const { data, error } = await supabase.rpc("create_invoice_from_quote", {
        p_id: id, p_quote_id: fromQuoteId, p_due_date: dueDate,
        p_discount_amount: discountAmount || 0, p_discount_reason: discountReason || "", p_notes: notes || ""
      });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (!clientId || !lineItems?.length) {
      return res.status(400).json({ error: "For a standalone invoice, clientId and at least one line item are required" });
    }
    const { data, error } = await supabase.rpc("create_standalone_invoice", {
      p_id: id, p_client_id: clientId, p_due_date: dueDate, p_services_description: servicesDescription || "",
      p_line_items: lineItems, p_subtotal: subtotal, p_discount_amount: discountAmount || 0,
      p_discount_reason: discountReason || "", p_vat_rate: vatRate, p_notes: notes || ""
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: "id and status are required" });
    const { data, error } = await supabase.rpc("update_invoice_status", { p_id: id, p_status: status });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: "Method not allowed" });
}
