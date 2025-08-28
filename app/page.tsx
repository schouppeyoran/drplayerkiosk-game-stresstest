import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-4">
      <Link href="/game">
        <h1>drPlayerKiosk test</h1>
        <Button>Go to stress test</Button>
      </Link>
    </div>
  );
}
