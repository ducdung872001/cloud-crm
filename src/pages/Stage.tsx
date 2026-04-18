import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { findProject } from "../data/projects";
import { findStage } from "../data/pipeline";
import PipelineStrip from "../components/PipelineStrip";
import Stage1 from "./stages/Stage1";
import Stage2 from "./stages/Stage2";
import Stage3 from "./stages/Stage3";
import Stage4 from "./stages/Stage4";
import Stage5 from "./stages/Stage5";
import Stage6 from "./stages/Stage6";
import Stage7 from "./stages/Stage7";
import StageHero from "./stages/StageHero";

const BODIES: Record<number, () => JSX.Element> = {
  1: Stage1,
  2: Stage2,
  3: Stage3,
  4: Stage4,
  5: Stage5,
  6: Stage6,
  7: Stage7,
};

export default function Stage() {
  const { id, n } = useParams<{ id: string; n: string }>();
  const { currentProject, setCurrentProject } = useApp();

  const project = id ? findProject(id) : undefined;
  const num = Number(n);
  const step = findStage(num);

  useEffect(() => {
    if (project && project.id !== currentProject.id) setCurrentProject(project.id);
  }, [project, currentProject.id, setCurrentProject]);

  if (!project || !step) return <Navigate to="/hub" replace />;

  const Body = BODIES[num];

  return (
    <section>
      <StageHero stage={step} />
      <PipelineStrip projectId={project.id} currentStage={num} />
      {Body ? <Body /> : null}
    </section>
  );
}
