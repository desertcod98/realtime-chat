export default function Message({ content }: { content: String }) {
  return (
    <div className="my-40 bg-slate-300">
      <span>{content}</span>
    </div>
  );
}
