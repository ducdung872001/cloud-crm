import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";

const HIGH_PRIORITY = 1500;

const COLOR_MAP = {
  // Start Event - Xanh la
  "bpmn:StartEvent": { stroke: "#4CAF50", fill: "#E8F5E9" },
  // End Event - Do
  "bpmn:EndEvent": { stroke: "#F44336", fill: "#FFEBEE" },
  // Task - Xanh duong
  "bpmn:Task": { stroke: "#1976D2", fill: "#E3F2FD" },
  "bpmn:UserTask": { stroke: "#1976D2", fill: "#E3F2FD" },
  "bpmn:ServiceTask": { stroke: "#1976D2", fill: "#E3F2FD" },
  "bpmn:ScriptTask": { stroke: "#1976D2", fill: "#E3F2FD" },
  "bpmn:SendTask": { stroke: "#1976D2", fill: "#E3F2FD" },
  "bpmn:ReceiveTask": { stroke: "#1976D2", fill: "#E3F2FD" },
  "bpmn:ManualTask": { stroke: "#1976D2", fill: "#E3F2FD" },
  "bpmn:BusinessRuleTask": { stroke: "#1976D2", fill: "#E3F2FD" },
  "bpmn:CallActivity": { stroke: "#1976D2", fill: "#E3F2FD" },
  // Gateway - Vang cam
  "bpmn:ExclusiveGateway": { stroke: "#F57C00", fill: "#FFF3E0" },
  "bpmn:ParallelGateway": { stroke: "#F57C00", fill: "#FFF3E0" },
  "bpmn:InclusiveGateway": { stroke: "#F57C00", fill: "#FFF3E0" },
  "bpmn:ComplexGateway": { stroke: "#F57C00", fill: "#FFF3E0" },
  "bpmn:EventBasedGateway": { stroke: "#F57C00", fill: "#FFF3E0" },
  // Intermediate Event - Vang
  "bpmn:IntermediateCatchEvent": { stroke: "#FFA000", fill: "#FFF8E1" },
  "bpmn:IntermediateThrowEvent": { stroke: "#FFA000", fill: "#FFF8E1" },
  // Boundary Event - Tim
  "bpmn:BoundaryEvent": { stroke: "#7B1FA2", fill: "#F3E5F5" },
  // SubProcess - Xanh teal
  "bpmn:SubProcess": { stroke: "#00796B", fill: "#E0F2F1" },
};

export default class ColorRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element) {
    return !!COLOR_MAP[element.type];
  }

  drawShape(parentNode, element) {
    const colors = COLOR_MAP[element.type];
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    if (colors) {
      // SVG shapes: rect for tasks/subprocess, circle for events, polygon for gateways
      const svgElements = parentNode.querySelectorAll("rect, circle, polygon, path");
      svgElements.forEach((svg) => {
        const currentFill = svg.getAttribute("fill");
        const currentStroke = svg.getAttribute("stroke");

        // Chi to mau cho shape chinh (khong phai icon ben trong)
        if (currentFill && currentFill !== "none" && currentFill !== "transparent") {
          svg.setAttribute("fill", colors.fill);
        }
        if (currentStroke && currentStroke !== "none" && currentStroke !== "transparent") {
          svg.setAttribute("stroke", colors.stroke);
        }
      });
    }

    return shape;
  }

  getShapePath(element) {
    return this.bpmnRenderer.getShapePath(element);
  }
}

ColorRenderer.$inject = ["eventBus", "bpmnRenderer"];
