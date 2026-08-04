export default function BookingConfirmationDocument({ data, selectedClient, selectedBooking, setPage }) {
  const client = data.clients.find((c) => c.id === selectedClient);
  const booking = selectedBooking;

  if (!booking) {
    return (
      <div className="report-shell">
        <div className="report-toolbar no-print"><button className="secondary" onClick={() => setPage("client")}>Back</button></div>
        <p style={{ padding: 40 }}>No booking confirmation selected.</p>
      </div>
    );
  }

  return (
    <div className="report-shell">
      <div className="report-toolbar no-print">
        <button className="secondary" onClick={() => setPage("client")}>Back to Client</button>
        <button className="primary" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="quote-page booking-confirmation-page">
        <header className="report-header">
          <div className="report-brand">
            <div className="report-bars"><span /><span /><span /></div>
            <div><strong>{booking.businessDetailsSnapshot?.legalName || "KIST PERFORMANCE GROUP"}</strong><span>Booking Confirmation</span></div>
          </div>
          <div className="report-date">{booking.bookingNumber}</div>
        </header>

        <p className="booking-confirmation-greeting">This confirms the following visit has been booked for {client?.name}.</p>

        <div className="quote-meta-grid booking-meta-grid">
          <div><b>Visit Type</b><p>{booking.visitType}</p></div>
          <div><b>Date</b><p>{booking.visitDate}</p></div>
          <div><b>Time</b><p>{booking.startTime} – {booking.endTime}</p></div>
          <div><b>Status</b><p>{booking.status}</p></div>
          <div><b>Location</b><p>{booking.location || "To be confirmed"}</p></div>
          <div><b>Consultant</b><p>{booking.consultant || "To be confirmed"}</p></div>
          <div><b>Attendees Expected</b><p>{booking.attendees || "Not specified"}</p></div>
        </div>

        {booking.notes && <p className="quote-notes">{booking.notes}</p>}

        <p className="quote-acceptance-note">
          This booking is made subject to KIST's Terms and Conditions of Business (effective {booking.termsVersion}),
          available at {booking.businessDetailsSnapshot?.website || "kistconsulting.co.uk"}/terms or on request from{" "}
          {booking.businessDetailsSnapshot?.contactEmail || "kistconsultinguk@gmail.com"}. Booking or permitting KIST to
          begin the Services forms a contract on those terms.
        </p>

        <div className="quote-terms-section booking-footer-note">
          <p className="terms-p">Please contact us as soon as possible if you need to reschedule or cancel this visit — see clause 10 of our Terms and Conditions for applicable notice periods and any charges that may apply.</p>
        </div>
      </div>
    </div>
  );
}
