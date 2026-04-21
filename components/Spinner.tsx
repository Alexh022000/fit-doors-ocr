export default function Spinner() {
  return (
    <div
      className="spinner w-12 h-12 rounded-full border-4 border-fit-red-light"
      style={{ borderTopColor: "#E63026" }}
      aria-label="Chargement"
      role="status"
    />
  );
}
