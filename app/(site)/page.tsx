
import { BsChatLeftText } from "@react-icons/all-files/bs/BsChatLeftText";

export default async function Home() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center rounded-full bg-slate-100 w-96 h-96 justify-center gap-3">
        <BsChatLeftText size={150} opacity={0.4} />
        <span className="font-medium text-center">Select an existing chat <br/>or create a new one</span>
      </div>
    </div>
  );
}
