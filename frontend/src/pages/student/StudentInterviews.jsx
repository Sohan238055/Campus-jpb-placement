import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

export default function StudentInterviews() {
  const [apps, setApps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null); // application being viewed for slots
  const [slots, setSlots] = useState(null);
  const [slotsError, setSlotsError] = useState("");
  const [booking, setBooking] = useState(null);
  const [bookErr, setBookErr] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/api/applications")
      .then((res) => setApps(res.data.data.filter((a) => ["Shortlisted", "Interview Scheduled"].includes(a.status))))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load applications"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openSlots = async (app) => {
    setActive(app);
    setSlots(null);
    setSlotsError("");
    setBookErr("");
    try {
      const { data } = await api.get(`/api/interviews/slots/student/${app.driveId}`);
      setSlots(data.slots);
    } catch (err) {
      setSlotsError(err?.response?.data?.message || "Failed to load slots");
    }
  };

  const book = async (slot) => {
    setBooking(slot._id);
    setBookErr("");
    try {
      await api.post("/api/interviews/slots/book", { slotId: slot._id, driveId: active.driveId });
      setActive(null);
      load();
    } catch (err) {
      setBookErr(err?.response?.data?.message || "Booking failed");
    } finally {
      setBooking(null);
    }
  };

  if (loading) return <Loader label="Loading interviews" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Next Steps</span>
          <h1>Interviews</h1>
          <div className="page-sub">Book a slot once you're shortlisted for a drive.</div>
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState mark="⟡" title="No shortlists yet" hint="You'll see interview slots here once shortlisted." />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {apps.map((a) => (
            <div className="card card-pad" key={a._id} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <h3 style={{ fontSize: 16 }}>{a.company}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 4 }}>{a.role}</div>
                {a.status === "Interview Scheduled" && (
                  <div style={{ fontSize: 12.5, marginTop: 8, fontFamily: "var(--font-mono)" }}>
                    {a.interviewDate} · {a.interviewTime} · {a.interviewMode}
                  </div>
                )}
              </div>
              {a.status === "Shortlisted" && (
                <button className="btn btn-brass" onClick={() => openSlots(a)}>
                  View available slots
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {active && (
        <Modal title={`Book a slot — ${active.company}`} subtitle={active.role} onClose={() => setActive(null)}>
          {slotsError && <div className="alert alert-error">{slotsError}</div>}
          {bookErr && <div className="alert alert-error">{bookErr}</div>}
          {!slots && !slotsError ? (
            <Loader label="Loading slots" />
          ) : slots && slots.length === 0 ? (
            <EmptyState mark="⟡" title="No open slots right now" hint="Check back later." />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {slots?.map((s) => (
                <div key={s._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--line)", borderRadius: 3, padding: "10px 14px" }}>
                  <div style={{ fontSize: 13.5 }}>
                    <strong>{s.date}</strong> · {s.time} · {s.mode}
                  </div>
                  <button className="btn btn-primary btn-sm" disabled={booking === s._id} onClick={() => book(s)}>
                    {booking === s._id ? "Booking…" : "Book"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
