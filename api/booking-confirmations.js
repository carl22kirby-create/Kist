import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";

export default async function handler(req, res) {
  if (!(await requireAuth(req, res, supabase))) return;

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

  res.status(405).json({ error: "Method not allowed" });
}
