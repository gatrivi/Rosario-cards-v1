function PrayerButtons() {
  return (
    <div
      className="button-grid"
      style={{
        height: "40vh",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px",
        padding: "10px",
      }}
    ></div>
  );
}
export default PrayerButtons;
