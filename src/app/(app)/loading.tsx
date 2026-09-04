import { LoadingState } from "@/components/shared/loading-state";

export default function AppLoading() {
  return (
    <div className="py-12">
      <LoadingState message="Loading module..." />
    </div>
  );
}
