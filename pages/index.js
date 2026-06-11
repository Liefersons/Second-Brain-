import dynamic from "next/dynamic";

const SecondBrain = dynamic(
  () => import("../components/SecondBrain"),
  { ssr: false }
);

export default function Home() {
  return <SecondBrain />;
}
