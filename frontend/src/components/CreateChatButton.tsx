interface Props {
  role: string;
  content: string;
}

export default function MessageBubble({
  role,
  content,
}: Props) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isUser
            ? "bg-black text-white"
            : "bg-gray-200"
        }`}
      >
        {content}
      </div>
    </div>
  );
}