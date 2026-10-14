import { Shell } from "./components/layout/Shell";
import { AdvisorView } from "./components/advisor/AdvisorView";
import { AdvisorsView } from "./components/advisor/AdvisorsView";
import { CompareView } from "./components/compare/CompareView";
import { DecideView } from "./components/decide/DecideView";
import { ScenarioView } from "./components/decide/ScenarioView";
import { DrillView } from "./components/drill/DrillView";
import { HomeView } from "./components/home/HomeView";
import { LearnView } from "./components/learn/LearnView";
import { LessonView } from "./components/learn/LessonView";
import { TrackView } from "./components/learn/TrackView";
import { ProgressView } from "./components/progress/ProgressView";
import { useRoute } from "./lib/router";

function Screen() {
  const route = useRoute();
  switch (route.name) {
    case "home":
      return <HomeView />;
    case "learn":
      return <LearnView />;
    case "track":
      return <TrackView trackId={route.trackId} />;
    case "lesson":
      return <LessonView lessonId={route.lessonId} />;
    case "decide":
      return <DecideView />;
    case "scenario":
      return <ScenarioView scenarioId={route.scenarioId} />;
    case "drill":
      return <DrillView trackId={route.trackId} />;
    case "advisors":
      return <AdvisorsView />;
    case "advisor":
      return <AdvisorView advisorId={route.advisorId} />;
    case "compare":
      return <CompareView />;
    case "progress":
      return <ProgressView />;
  }
}

export default function App() {
  return (
    <Shell>
      <Screen />
    </Shell>
  );
}
