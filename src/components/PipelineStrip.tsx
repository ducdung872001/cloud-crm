import { useNavigate } from "react-router-dom";
import { PIPELINE } from "../data/pipeline";

interface Props {
  projectId: string;
  currentStage: number;
}

export default function PipelineStrip({ projectId, currentStage }: Props) {
  const navigate = useNavigate();

  return (
    <div className="pipeline">
      {PIPELINE.map((s) => {
        const state = s.num < currentStage ? "done" : s.num === currentStage ? "current" : "";
        return (
          <div key={s.num} className={`pipe-step ${state}`} onClick={() => navigate(`/project/${projectId}/stage/${s.num}`)}>
            <div className="pn">
              {s.code}
              {state === "current" ? " · đang làm" : ""}
            </div>
            <div className="pl">{s.label.split(" + ")[0]}</div>
            <div className="pm">
              <span className={s.status === "ai" ? "dot-ai" : "dot-hu"} />
              {s.status === "ai" ? "AI" : "Human"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
