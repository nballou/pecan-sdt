import Joyride, { ACTIONS, STATUS, EVENTS } from "react-joyride";
import useTrackDisplayTime from "./hooks/useTrackDisplayTime";
import Markdown from "markdown-to-jsx";
import { ScrollShadow } from "@heroui/react";

const LastStep = ({ content }) => {
  useTrackDisplayTime("onboarding-lastStep");
  return (
    <ScrollShadow className="max-h-[250px]">
      <Markdown className="rich-text" children={content} />
    </ScrollShadow>
  );
};

const stepKeys = [
  "first",
  "nodeSelectStep",
  "nodeRankingtep",
  "linkRatingStepOne",
  "linkRatingStrengthStep",
  "linkRatingStepTwo",
  "last",
];

export default function NetworkOnboarding({
  content,
  state,
  dispatch,
  globaDispatch,
}) {
  const { onboarding } = state;
  const {
    buttonLabelNext,
    buttonLabelBack,
    buttonLabelLast,
    buttonLabelSkip,
    showSkipButton,
  } = content;

  const linkRatingStepKeys = new Set(["linkRatingStepOne", "linkRatingStrengthStep", "linkRatingStepTwo"]);

  const steps = stepKeys.map((key) => {
    const obj = content[key] ?? {};
    if (key == "last") {
      return {
        target: "body",
        ...obj,
        content: obj.content ? <LastStep content={obj.content} /> : <></>,
      };
    } else {
      return {
        target: key === "linkRatingStrengthStep" ? ".linkRatingStrengthSection" : "body",
        placement: key === "linkRatingStrengthStep" ? "bottom" : undefined,
        ...obj,
        content: obj.content ? (
          <ScrollShadow className="max-h-[150px]">
            <Markdown className="rich-text" children={obj.content} />
          </ScrollShadow>
        ) : <></>,
      };
    }
  });

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      globaDispatch({ type: "show_builder" });
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      switch (nextStepIndex) {
        case 0:
          dispatch({
            type: "load_data",
            data: {
              ...state,
              onboarding: {
                ...onboarding,
                stepIndex: nextStepIndex,
              },
            },
          });
          break;
        case 1:
          dispatch({
            type: "load_data",
            data: {
              ...state,
              onboarding: {
                ...onboarding,
                stepIndex: nextStepIndex,
              },
            },
          });
          break;
        case 2:
          dispatch({
            type: "load_data",
            data: {
              ...state,
              nodes: state.nodes.map((node) => ({
                ...node,
                chosen: true,
              })),
              currentProgress: 1,
              nodeCount: 2,
              onboarding: {
                ...onboarding,
                stepIndex: nextStepIndex,
              },
            },
          });
          break;
        case 3:
          dispatch({
            type: "load_data",
            data: {
              ...state,
              nodes: state.nodes.map((node) => ({
                ...node,
                size: node.size || 50,
              })),
              currentProgress: nextStepIndex,
              highlightNode: [0],
              onboarding: {
                ...onboarding,
                stepIndex: nextStepIndex,
              },
            },
          });
          break;
        case 4: {
          // linkRatingStrengthStep: keep same view but pre-set a direction so
          // strength buttons are already visible when the step loads
          const node0 = state.nodes[0];
          const node1 = state.nodes[1];
          const hasLink = state.links.some((l: any) => {
            const srcId = l.source?.id ?? l.source;
            return srcId == node0?.id;
          });
          dispatch({
            type: "load_data",
            data: {
              ...state,
              links: hasLink
                ? state.links
                : [...state.links, { source: node0, target: node1, size: 75, display: true }],
              linkCount: hasLink ? state.linkCount : (state.linkCount || 0) + 1,
              currentProgress: 3,
              onboarding: {
                ...onboarding,
                stepIndex: nextStepIndex,
              },
            },
          });
          break;
        }
        case 5:
          dispatch({
            type: "load_data",
            data: {
              ...state,
              currentProgress: 4,
              highlightNode: [1],
              onboarding: {
                ...onboarding,
                stepIndex: nextStepIndex,
              },
            },
          });
          break;
        case 6:
          dispatch({
            type: "load_data",
            data: {
              ...state,
              currentProgress: 5,
              highlightNode: [],
              onboarding: {
                ...onboarding,
                stepIndex: nextStepIndex,
              },
            },
          });
          break;
        case 7:
          globaDispatch({ type: "show_builder" });
          break;
      }
    }
  };

  return (
    <Joyride
      continuous
      callback={handleJoyrideCallback}
      locale={{
        back: buttonLabelBack,
        close: "Close",
        last: buttonLabelLast,
        next: buttonLabelNext,
        nextLabelWithProgress: "Next (Step {step} of {steps})",
        open: "Open the dialog",
        skip: buttonLabelSkip,
      }}
      stepIndex={onboarding.stepIndex}
      run={onboarding?.show}
      scrollToFirstStep={false}
      showProgress
      disableCloseOnEsc={true}
      showSkipButton={showSkipButton}
      steps={steps}
      disableOverlayClose
      spotlightClicks
      hideCloseButton
      disableOverlay
      styles={{
        options: {
          primaryColor: "#006FEE",
          arrowColor: "#f31260",
        },
        tooltip: {
          borderColor: "#f31260",
          borderWidth: "5px",
          fontWeight: 500,
        },
        tooltipContent: {
            paddingBottom: "0px",
            paddingLeft: "0px",
            paddingRight: "0px"
        }
      }}
    />
  );
}
