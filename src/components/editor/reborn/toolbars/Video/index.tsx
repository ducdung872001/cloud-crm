import React, { useState, Fragment } from "react";
import Tippy from "@tippyjs/react";
import { CustomEditor } from "components/editor/custom-types";
import { useSlateStatic } from "slate-react";
import { Button, Icon } from "../../../components";
import ModalAddVideo from "../../modals/Video";
import { insertVideo as insertVideoIntoEditor } from "../../plugins/withMedias";
import "tippy.js/dist/tippy.css";

const InsertVideoButton = () => {
  const editor = useSlateStatic();
  const [showModalVideo, setShowModalVideo] = useState<boolean>(false);

  return (
    <Fragment>
      <Button
        onClick={(event) => {
          event.preventDefault();

          // đoạn này dành cho video
          setShowModalVideo(!showModalVideo);
        }}
      >
        <Tippy content="Tải video lên">
          <Icon>movie</Icon>
        </Tippy>
      </Button>

      <ModalAddVideo
        onShow={showModalVideo}
        onHide={() => setShowModalVideo(false)}
        callback={(url, thumbnail) => insertVideos(editor, url, thumbnail)}
      />
    </Fragment>
  );
};

// Gọi nhiều lần để tải 1 loạt ảnh
const insertVideos = (editor: CustomEditor, url: string, thumbnail?: string) => {
  insertVideoIntoEditor(editor, url, thumbnail);
};

export { InsertVideoButton };
