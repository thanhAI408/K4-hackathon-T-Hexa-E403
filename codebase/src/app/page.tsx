import { MeetFlowApp } from "@/components/meetflow-app";

export default function HomePage() {
  return <MeetFlowApp aiConfigured={Boolean(process.env.OPENAI_API_KEY)} />;
}
