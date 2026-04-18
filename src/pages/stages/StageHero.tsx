import { useApp } from "../../context/AppContext";
import type { PipelineStep } from "../../data/pipeline";
import ProjectActionsMenu from "../../forms/project/ProjectActionsMenu";

interface Props {
  stage: PipelineStep;
}

export default function StageHero({ stage }: Props) {
  const { showToast, currentProject } = useApp();
  return (
    <div className="hero">
      <div>
        <div className="ribbon">{stage.ribbon}</div>
        <div className="kicker">{stage.kicker}</div>
        <h1 className="title">{stage.title}</h1>
        <p className="desc">{stage.desc}</p>
      </div>
      <div className="actions">
        <button type="button" className="btn" onClick={() => showToast("info", "Export", `Stage ${stage.code}`)}>
          ↗ Export
        </button>
        <button type="button" className="btn ai" onClick={() => showToast("info", "AI action", `Stage ${stage.code}`)}>
          ✦ AI action
        </button>
        <ProjectActionsMenu project={currentProject} />
      </div>
    </div>
  );
}
