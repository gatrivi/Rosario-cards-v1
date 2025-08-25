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
    >
      {/* Category 1 */}
      <div className="category">
        <button style={{ width: "100%", height: "50px" }}>
          Senal de la Cruz
        </button>
        {/* Add more */}
      </div>
      {/* Category 2 */}
      <div className="category">
        <button style={{ width: "100%", height: "40px" }}>
          Oraciones de la Decada
        </button>
        {/* Vary sizes */}
      </div>
      {/* Category 3: Nested */}
      <div className="category mysteries">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "5px",
          }}
        >
          {/* Series 1 */}
          <button style={{ height: "60px" }}>
            Primer Misterio Glorioso
          </button>{" "}
          {/* Larger */}
          {/* Repeat for 5, then next series */}
        </div>
        {/* Repeat for 4 series */}
      </div>
      {/* Category 4 */}
      <div className="category">
        <button style={{ width: "100%", height: "30px" }}>Salve</button>{" "}
        {/* Smaller */}
      </div>
    </div>
  );
}
export default PrayerButtons;
