import Image from "next/image"

export default function Spinner(){
  return (
    <div>
      <Image
        src={"/assets/spinner.svg"}
        width={40}
        height={40}
        alt="Loading spinner"
      />
    </div>
  )
}