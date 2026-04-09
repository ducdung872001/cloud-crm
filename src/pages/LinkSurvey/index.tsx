import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import parser from "html-react-parser";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import { getSearchParameters } from "reborn-util";
import SurveyFormService from "services/SurveyFormService";
import Button from "components/button/button";
import { showToast } from "utils/common";
import "./index.scss";

export default function LinkSurvey() {
  document.title = "Phiếu khảo sát khách hàng";

  const params: any = getSearchParameters();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loadingGif = require("assets/images/image-success.gif");

  const [detailSurvey, setDetailSurvey] = useState(null);
  const [checkParagraph, setCheckParagraph] = useState<number>(0);

  const handGetSurvey = async (id: number) => {
    if (!id) return;

    const response = await SurveyFormService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      setDetailSurvey(result);
      setCheckParagraph(result.cta.length);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (params.id) {
      handGetSurvey(+params.id);
    }
  }, [params.id]);

  const defaultFormData = {
    id: null,
    rating: null,
    key: "",
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (detailSurvey) {
      setFormData({ ...formData, id: detailSurvey?.id });
    }
  }, [detailSurvey]);

  useEffect(() => {
    if (params.key) {
      setFormData({ ...formData, key: params?.key });
    }
  }, [params?.key]);

  const [rating, setRating] = useState<number>(0);

  const [ratingStart, setRatingStart] = useState<number>(0);
  const [hoverStart, setHoverStart] = useState<number>(0);

  const [idxEmoticon, setIdxEmticon] = useState<any>(null);

  useEffect(() => {
    if (rating) {
      setFormData({ ...formData, rating: rating });
    }
  }, [rating]);

  const lstEmotion = detailSurvey
    ? detailSurvey.range == 2
      ? [
          {
            id: 1,
            name: "Không hài lòng",
            emotion: "😞",
          },
          {
            id: 2,
            name: "Chưa hài lòng",
            emotion: "😐",
          },
          {
            id: 3,
            name: "Trung bình",
            emotion: "🙂",
          },
          {
            id: 4,
            name: "Hài lòng",
            emotion: "😊",
          },
          {
            id: 5,
            name: "Rất hài lòng",
            emotion: "😄",
          },
        ]
      : [
          {
            id: 1,
            name: "Chưa hài lòng",
            emotion: "😞",
          },
          {
            id: 3,
            name: "Trung bình",
            emotion: "🙂",
          },
          {
            id: 5,
            name: "Rất hài lòng",
            emotion: "😄",
          },
        ]
    : [];

  const lstStar = detailSurvey
    ? detailSurvey.range == 2
      ? [
          {
            id: 1,
            icon: <Icon name="Star" />,
          },
          {
            id: 2,
            icon: <Icon name="Star" />,
          },
          {
            id: 3,
            icon: <Icon name="Star" />,
          },
          {
            id: 4,
            icon: <Icon name="Star" />,
          },
          {
            id: 5,
            icon: <Icon name="Star" />,
          },
        ]
      : [
          {
            id: 1,
            icon: <Icon name="Star" />,
          },
          {
            id: 3,
            icon: <Icon name="Star" />,
          },
          {
            id: 5,
            icon: <Icon name="Star" />,
          },
        ]
    : [];

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [hasNextStep, setHasNextStep] = useState<boolean>(false);

  useEffect(() => {
    if (hasNextStep) {
      const globalAccess: any = document.body.querySelector("#container");

      if (globalAccess) {
        globalAccess.style.background = "#fff";
      }
    }
  }, [hasNextStep]);

  const handSubmitForm = async (e: any) => {
    e.preventDefault();

    setIsSubmit(true);

    const response = await SurveyFormService.submitVoc(formData);

    // để sau check lại ông này
    if (response.code === 200 || response.code === 0) {
      showToast("Gửi phiếu khảo sát thành công", "success");
      setHasNextStep(true);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsSubmit(false);
  };

  return (
    <div className="page__link--survey">
      {!hasNextStep ? (
        <form style={{ width: `${checkParagraph > 600 ? 62 : 50}rem` }} className="form__add--voc" onSubmit={(e) => handSubmitForm(e)}>
          <div className="content__survey">{detailSurvey && parser(DOMPurify.sanitize(detailSurvey.cta))}</div>
          <div className="evaluate__survey">
            {detailSurvey && detailSurvey.form == "1" && (
              <div className="lst__star--rating">
                {lstStar.map((item, idx) => {
                  return (
                    <div
                      key={idx + 1}
                      className={idx + 1 <= ((ratingStart && hoverStart) || hoverStart) ? "on" : "off"}
                      onClick={() => {
                        setRating(item.id);
                        setRatingStart(idx + 1);
                      }}
                      onMouseEnter={() => setHoverStart(idx + 1)}
                      onMouseLeave={() => setHoverStart(ratingStart)}
                      onDoubleClick={() => {
                        setRatingStart(0);
                        setHoverStart(0);
                      }}
                    >
                      <span className="item__star">{item.icon}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {detailSurvey && detailSurvey.form == "2" && (
              <div className="lst-evaluate--emoticon">
                {lstEmotion.map((item, idx) => {
                  return (
                    <div key={idx} className="item__evaluate">
                      <Tippy content={item.name}>
                        <div
                          className="icon-emoticon"
                          onClick={() => {
                            setIdxEmticon(idx);
                            setRating(item.id);
                          }}
                        >
                          {idx === idxEmoticon && (
                            <span className="check__emoticon">
                              <Icon name="Checked" />
                            </span>
                          )}
                          <span className="__icon">{item.emotion}</span>
                        </div>
                      </Tippy>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Button type="submit" color="destroy" className="btn__submit--form" disabled={isSubmit || !formData.rating}>
            Gửi đánh giá
            {isSubmit && <Icon name="Loading" />}
          </Button>
        </form>
      ) : (
        <div className="box__thank--you">
          <div className="icon__success">
            <img src={loadingGif} alt="" />
          </div>
          <div className="content">
            <h2 className="title-content">Cảm ơn quý khách hàng đã tham gia khảo sát</h2>
            <p className="desc">
              Chúng tôi trân trọng sự tham gia tích cực của bạn trong khảo sát. Đánh giá của bạn giúp chúng tôi hiểu rõ hơn về nhu cầu và mong muốn
              của khách hàng, từ đó liên tục cải tiến và cung cấp trải nghiệm tốt nhất cho bạn. Cảm ơn và chúc bạn một ngày tốt lành!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
