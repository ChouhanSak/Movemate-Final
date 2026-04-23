export default function EmptyState({ title, description }) {
  return (
    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}