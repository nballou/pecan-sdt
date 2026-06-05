"use client";

import { useState, useEffect, useContext, createContext, useReducer, useRef } from "react";
import Loader from "../../components/Loader";
import NetworkContext, { NetworkContextProvider } from "./reducer";
import NetworkBuilder from "./network-builder";
import NetworkViz from "./network-viz";
import * as d3 from "d3";

import { isFeedbackStep } from "./utils/progress"
import { useSearchParams } from 'next/navigation'

import useWindowSize from "./hooks/useWindowSize";
import Feedback from "./Feedback";
import { OnboardingContextProvider } from "./onboarding/reducer";
import Intro from "./builder/Intro";
import SurveyForm from "./builder/SurveyForm";
import ConsentStep from "./builder/ConsentStep";
import addNodesToLinks from "./utils/readd-nodes";
const IGNORE_NODES = process.env.NEXT_PUBLIC_IGNORE_NODES === "true"

const removeNull = (obj) => {
  if (!obj) return undefined
  const x = Object.fromEntries(
    Object.entries(obj)
      .filter(([key, value]) => value !== null && value !== undefined && value !== "")
  )
  return (x)
}

function deepMerge(target, source) {
  const filteredSource = removeNull(source)
  for (const key in filteredSource) {
    // Check if the property is an object, and exists in both target and source
    if (filteredSource[key] instanceof Object && key in target) {
      // Recursively merge both objects
      Object.assign(filteredSource[key], deepMerge(target[key], filteredSource[key]));
    }
  }
  // Merge source into target
  return Object.assign(target || {}, filteredSource);
}


const formatNodeData = ({node, id}) => {
  if (!node) return { label: "", name: "", nodeClarification: [], id }
  return (
    {
      ...node,
      "label": (node.label || "").replaceAll("<br />", " "),
      "name": node.label || "",
      nodeClarification: [],
      id: id
    }
  )
}

const NetworkApp = ({ feedback, networkBuilder, survey, consent }) => {
  const [isClient, setIsClient] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowSize(isClient);
  const { state, dispatch } = useContext(NetworkContext)
  const onboardingState = {
    nodes: [
      formatNodeData({node: networkBuilder?.onboarding?.demoNodeOne, id: 0}),
      formatNodeData({node: networkBuilder?.onboarding?.demoNodeTwo, id: 1}),
    ],
    nodeCount: 0,
    showNodeClarificationStep: false,
    links: [],
    linkCount: 0,
    currentProgress: 0,
    responseDirection: "outgoing",
    responsesRequired: false,
    completedSteps: [],
    telemetry: {},
    showBuilder: true,
    onboarding: { show: false, stepIndex: 0 }
  }
  useEffect(() => {
    const sessionState = JSON.parse(sessionStorage.getItem("state"));
    if (sessionState) {
      dispatch({ type: "load_data", data: sessionState });
    } else if (!state.pid) {
      dispatch({ type: "generate_pid" });
    }
    setIsClient(true);
  }, [])
  const [sliderState, setSlider] = useState(40);
  const { nodeCount, currentProgress, showNodeClarificationStep, showNodeRankingStep, showBuilder, surveyCompleted, consentCompleted } = state
  const showConsent = consent?.show && !consentCompleted && !showBuilder;
  const showSurvey = survey?.show && !surveyCompleted && !showBuilder && !showConsent;

  if (!isClient) return <Loader />;
  return (
    <div>
      <div className="flex flex-col-reverse sm:flex-row">
        {showConsent ? (
          <ConsentStep config={consent} />
        ) : showSurvey ? (
          <SurveyForm config={survey} />
        ) : showBuilder ? (
          <>
            {
              isFeedbackStep({ currentProgress, nodeCount, showNodeClarificationStep, showNodeRankingStep }) ?
                (
                  feedback?.showDetailedFeedback ?
                    <Feedback data={state} dispatch={dispatch} content={feedback} /> :
                    <div className="flex flex-col items-center justify-center min-h-[50dvh] w-full p-8 text-center">
                      <h2 className="text-2xl font-bold mb-4">{feedback?.participantThanks?.header || "Thank you!"}</h2>
                      <p className="text-lg text-gray-600">{feedback?.participantThanks?.body || "Your response has been recorded."}</p>
                      {state.pid && <p className="text-sm text-gray-500 mt-4">Your participant ID: <span className="font-mono font-semibold">{state.pid}</span></p>}
                      <button
                        onClick={() => dispatch({ type: "reset_for_new_graph" })}
                        className="mt-8 px-6 py-3 border border-gray-400 rounded-lg text-gray-600 hover:bg-gray-100"
                      >
                        Submit another graph
                      </button>
                    </div>
                ) : (
                  <>
                    <NetworkBuilder content={networkBuilder} state={state} dispatch={dispatch} />
                    <div className="flex-grow h-[calc(40dvh)] sm:h-[calc(100dvh)]" id="visualization">
                      <NetworkViz
                        dispatch={dispatch}
                        data={state}
                        sliderState={sliderState}
                        distance={0}
                        fixedWidth={windowWidth > 640 ? windowWidth - 400 : windowWidth}
                      />
                    </div>
                  </>
                )
            }
          </>
        ) : (
          <OnboardingContextProvider initialState={onboardingState}>
            <Intro data={networkBuilder} globaDispatch={dispatch} />
          </OnboardingContextProvider>
        )}
      </div>
    </div>
  )

}

export default function Network({ nodes, savedNetwork, lang, config, }) {

  const searchParams = useSearchParams()
  const pid = searchParams.get('pid')
  const ignoreNodesUrlParam = searchParams.get('ignoreNodes')
  let role
  const invited = searchParams.get('invited')
  const surveyPid = searchParams.get('surveyPid')
  let initialState
  if (typeof savedNetwork === "undefined") {
    role = searchParams.get('role')
    if (IGNORE_NODES || ignoreNodesUrlParam === "true") {
      initialState = {
        nodes: [],
        nodeCount: 0,
        showNodeClarificationStep: false,
        showNodeRankingStep: config?.networkBuilder?.nodeRankingStep?.show !== false,
        links: [],
        linkCount: 0,
        currentProgress: 0,
        responseDirection: config?.networkBuilder?.responseDirection || "incoming",
        responsesRequired: config?.networkBuilder?.responsesRequired || false,
        completedSteps: [],
        telemetry: {},
        locale: lang,
        role,
        invited,
        pid,
        surveyPid,
        showBuilder: false,
        surveyResponses: null,
        surveyCompleted: false
      }

    } else {
      const nodesUpdated = nodes.map((d, i) => {
        let questionPrompt
        let causePrompt
        if (d.attributes.overrides.length > 0) {
          questionPrompt = d.attributes.overrides[0].questionPrompt
          causePrompt = d.attributes.overrides[0].causePrompt
        } else {
          questionPrompt = d.attributes.questionPrompt
          causePrompt = d.attributes.causePrompt
        }

        return (
          {
            ...d.attributes,
            "label": d.attributes.label.replaceAll("<br />", " "),
            questionPrompt,
            causePrompt,
            "initialIndex": i,
            "id": d.id,
            "name": d.attributes.label,
            "highlight": false,
            "chosen": d.attributes.required || false,
            "size": null,
            "nodeClarificationSelected": []
          }
        )
      }
      )
      initialState = {
        // randomize order
        nodes: d3.shuffle(nodesUpdated),
        nodeCount: nodes.filter(node => node.attributes.required).length,
        showNodeClarificationStep: (config?.networkBuilder?.nodeClarificationStep.show && nodes.filter(node => node.attributes.nodeClarification.length > 0).length > 0) || false,
        showNodeRankingStep: config?.networkBuilder?.nodeRankingStep?.show !== false,
        links: [],
        linkCount: 0,
        currentProgress: 0,
        responseDirection: config?.networkBuilder?.responseDirection || "incoming",
        responsesRequired: config?.networkBuilder?.responsesRequired || false,
        completedSteps: [],
        telemetry: {},
        locale: lang,
        role,
        invited,
        pid,
        surveyPid,
        startTimestamp: Date.now(),
        timezoneOffset: new Date().getTimezoneOffset(),
        showBuilder: false,
        surveyResponses: null,
        surveyCompleted: false
      }
    }
  } else {
    role = savedNetwork.data.role
    initialState = { ...savedNetwork.data, showBuilder: true, url: savedNetwork.url }
    // readd nodes to links
    initialState = addNodesToLinks(initialState)
  }

  // TODO: merge nested
  const roleCustomization = config?.roleCustomization?.filter(d => d.customRole.data.attributes.roleId === role)?.[0]
  const networkBuilder = deepMerge(config?.networkBuilder, roleCustomization?.networkBuilder)
  //const networkBuilder = config.networkBuilder
  const feedback = deepMerge(config?.feedback, roleCustomization?.feedback)
  
  const survey = config?.survey;
  const consent = config?.consent;

  return (
    <NetworkContextProvider initialState={initialState}>
      <NetworkApp networkBuilder={networkBuilder} feedback={feedback} survey={survey} consent={consent} />
    </NetworkContextProvider>
  );
}


