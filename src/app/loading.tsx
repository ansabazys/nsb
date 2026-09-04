import { LoadingState } from "@/components/shared/loading-state";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Loading NSB..." />
    </div>
  );
}
