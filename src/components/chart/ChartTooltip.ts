export interface TooltipItem {
  label: string;
  value: string;
}

export interface TooltipSection {
  title: string;
  items: TooltipItem[];
}

export interface TooltipData {
  sections: TooltipSection[];
}

export const renderCustomTooltip = (data: TooltipData): string => {
  const sectionsHtml = data.sections.map(section => `
    <div style="
      font-weight: bold;
      font-size: 14px;
      margin-bottom: ${section === data.sections[0] ? '12px' : '8px'};
      margin-top: ${section === data.sections[0] ? '0' : '12px'};
      color: #fff;
    ">${section.title}</div>
    <ul style="
      list-style: disc;
      padding-left: 20px;
      margin: 0;
      line-height: 1.6;
    ">
      ${section.items.map((item, index) => `
        <li style="margin-bottom: ${index < section.items.length - 1 ? '4px' : '0'};">
          <span style="color: #e2e8f0;">${item.label}: </span>
          <span style="font-weight: 600;">${item.value}</span>
        </li>
      `).join('')}
    </ul>
  `).join('');

  return `
    <div style="
      background: linear-gradient(135deg, #4b5563 0%, #1f2937 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      min-width: 180px;
    ">
      ${sectionsHtml}
    </div>
  `;
};