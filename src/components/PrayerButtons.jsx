function PrayerButtons({ prayers, setPrayer }) {
  function makeAcronym(str) {
    return str
      .split(/\s+/) // Split by whitespace
      .map((word) => word[0]?.toUpperCase()) // Get first letter of each word, uppercase
      .join("") // Join letters
      .slice(0, 5);
  }
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
      {!prayers || prayers.length === 0 ? (
        <div>Loading...</div>
      ) : (
        prayers.map((prayer, index) => (
          <button onClick={() => setPrayer(prayer.text)} key={index}>
            {makeAcronym(prayer.title)}
          </button>
        ))
      )}
    </div>
  );
}
export default PrayerButtons;
