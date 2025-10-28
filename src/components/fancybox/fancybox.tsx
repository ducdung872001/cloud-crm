import React, { useRef, useEffect, PropsWithChildren } from "react";

import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import type { OptionsType } from "@fancyapps/ui/types/Fancybox/options";

import { downloadImage } from "utils/common";

interface Props {
  delegate?: string;
  options?: Partial<OptionsType>;
}

function Fancybox(props: PropsWithChildren<Props>) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const delegate = props.delegate || "[data-fancybox]";

    const options = props.options || {
      Carousel: {
        Navigation: true,
      },
      Toolbar: {
        items: {
          downloadCustom: {
            tpl: `<button title="Tải xuống" class="f-button"><svg><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/></svg></button>`,
            click: (instance: any) => {
              const takeImage = instance.instance.userSlides[0].src;
              downloadImage(takeImage, "");
            },
          },
        },
        display: {
          left: ["infobar"],
          middle: ["zoomIn", "zoomOut", "toggle1to1", "rotateCCW", "rotateCW", "flipX", "flipY"],
          right: ["slideshow", "downloadCustom", "thumbs", "close"],
        },
      },
    };

    NativeFancybox.bind(container, delegate, options);

    return () => {
      NativeFancybox.unbind(container);
      NativeFancybox.close();
    };
  }, [props.delegate, props.options]);

  return <div ref={containerRef}>{props.children}</div>;
}

export default Fancybox;
