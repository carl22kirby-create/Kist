import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";

// Consolidates what were five separate files (quotes, invoices,
// invoice-payments, booking-confirmations, business-settings) into one,
// dispatched by ?type=. Same reason as auth.js — Vercel's Hobby plan caps
// Serverless Functions at 12 per project, and every file under /api
// counts as one regardless of size.
export default async function handler(req, res) {
  if (!(await requireAuth(req, res, supabase))) return;
  const type = req.query.type;

  // ---- Business Settings ----
  if (type === "business-settings") {
    if (req.method === "GET") {
      const { data, error } = await supabase.rpc("get_business_settings");
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === "PUT") {
      const details = req.body;
      if (!details) return res.status(400).json({ error: "Missing request body" });
      const { data, error } = await supabase.rpc("update_business_settings", { details });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ---- Quotes ----
  if (type === "quote") {
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ---- Booking Confirmations ----
  if (type === "booking") {
    if (req.method === "GET") {
      const { clientId } = req.query;
      if (!clientId) return res.status(400).json({ error: "clientId is required" });
      const { data, error } = await supabase.rpc("get_booking_confirmations_for_client", { p_client_id: clientId });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === "POST") {
      const { clientId, scheduleId, visitType, visitDate, startTime, endTime, location, consultant, attendees, notes } = req.body || {};
      if (!clientId || !visitType || !visitDate || !startTime || !endTime) {
        return res.status(400).json({ error: "clientId, visitType, visitDate, startTime and endTime are required" });
      }
      const id = "bk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      const { data, error } = await supabase.rpc("create_booking_confirmation", {
        p_id: id, p_client_id: clientId, p_schedule_id: scheduleId || null, p_visit_type: visitType,
        p_visit_date: visitDate, p_start_time: startTime, p_end_time: endTime,
        p_location: location || "", p_consultant: consultant || "", p_attendees: attendees || "", p_notes: notes || ""
      });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === "PATCH") {
      const { id, status } = req.body || {};
      if (!id || !status) return res.status(400).json({ error: "id and status are required" });
      const { data, error } = await supabase.rpc("update_booking_confirmation_status", { p_id: id, p_status: status });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ---- Invoices ----
  if (type === "invoice") {
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ---- Invoice Payments ----
  if (type === "payment") {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
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
    return res.status(200).json(data);
  }

  // ---- Commercial Overview (Dashboard) ----
  if (type === "overview") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const { data, error } = await supabase.rpc("get_commercial_overview");
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ---- Expenses ----
  if (type === "expense") {
    if (req.method === "GET") {
      const { from, to } = req.query;
      const { data, error } = await supabase.rpc("get_expenses", { p_from: from || null, p_to: to || null });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === "POST") {
      const { date, supplier, description, category, amount, vatAmount, receiptUrl, receiptPath, notes } = req.body || {};
      if (!date || amount === undefined || amount === null) {
        return res.status(400).json({ error: "date and amount are required" });
      }
      const id = "exp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      const { data, error } = await supabase.rpc("create_expense", {
        p_id: id, p_date: date, p_supplier: supplier || "", p_description: description || "",
        p_category: category || "Other business expenses", p_amount: amount, p_vat_amount: vatAmount || 0,
        p_receipt_url: receiptUrl || null, p_receipt_path: receiptPath || null, p_notes: notes || ""
      });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === "PATCH") {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: "id is required" });
      const { data, error } = await supabase.rpc("update_expense", { p_id: id, p_updates: updates });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "id is required" });
      const { error } = await supabase.rpc("delete_expense", { p_id: id });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ deleted: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ---- Finance Summary and Income ----
  if (type === "finance-summary") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const { from, to } = req.query;
    const { data, error } = await supabase.rpc("get_finance_summary", { p_from: from || null, p_to: to || null });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (type === "income") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const { from, to } = req.query;
    const { data, error } = await supabase.rpc("get_income_for_period", { p_from: from || null, p_to: to || null });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(400).json({ error: "Unknown or missing type. Use ?type=quote|booking|invoice|payment|business-settings|overview|expense|finance-summary|income" });
}
