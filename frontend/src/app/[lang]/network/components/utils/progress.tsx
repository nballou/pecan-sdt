

// Calculate the base offset for steps based on which optional steps are shown
const getStepOffset = (showNodeClarificationStep, showNodeRankingStep = true) => {
  let offset = 1; // Node select is always step 0
  if (showNodeClarificationStep) offset += 1;
  if (showNodeRankingStep) offset += 1;
  return offset;
}

const getLinkProgress = ({currentProgress, showNodeClarificationStep, showNodeRankingStep = true}) => {
  const offset = getStepOffset(showNodeClarificationStep, showNodeRankingStep);
  return currentProgress - offset - 1; // -1 for link intro step
}

const getNodeRankIndex = (showNodeClarificationStep) => {
  return (showNodeClarificationStep ? 2 : 1)
}

const getLinkIntroIndex = (showNodeClarificationStep, showNodeRankingStep = true) => {
  let index = 1; // After node select
  if (showNodeClarificationStep) index += 1;
  if (showNodeRankingStep) index += 1;
  return index;
}

const isNodeSelectStep = ({ currentProgress }) => {
  return currentProgress == 0
}

const isNodeClarificationStep = ({ currentProgress, showNodeClarificationStep }) => {
  return showNodeClarificationStep && currentProgress == 1
}

const isNodeRankingStep = ({ currentProgress, showNodeClarificationStep, showNodeRankingStep = true }) => {
  if (!showNodeRankingStep) return false;
  return currentProgress == getNodeRankIndex(showNodeClarificationStep)
}

const isLinkRankingIntroStep = ({ currentProgress, nodeCount, showNodeClarificationStep, showNodeRankingStep = true }) => {
  return currentProgress == getLinkIntroIndex(showNodeClarificationStep, showNodeRankingStep)
}

const isLinkRankingStep = ({ currentProgress, nodeCount, showNodeClarificationStep, showNodeRankingStep = true }) => {
  const linkIntroIndex = getLinkIntroIndex(showNodeClarificationStep, showNodeRankingStep);
  return currentProgress > linkIntroIndex &&
    currentProgress <= nodeCount + linkIntroIndex
}

const isSubmitStep = ({ currentProgress, nodeCount, showNodeClarificationStep, showNodeRankingStep = true }) => {
  const linkIntroIndex = getLinkIntroIndex(showNodeClarificationStep, showNodeRankingStep);
  return currentProgress == nodeCount + linkIntroIndex + 1
}

const isFeedbackStep = ({currentProgress, nodeCount, showNodeClarificationStep, showNodeRankingStep = true }) => {
  const linkIntroIndex = getLinkIntroIndex(showNodeClarificationStep, showNodeRankingStep);
  return currentProgress > nodeCount + linkIntroIndex + 1
}

const updateCompletedSteps = ({
  nodes,
  links,
  currentProgress,
  nodeCount,
  completedSteps,
  showNodeClarificationStep,
  showNodeRankingStep = true,
  responseDirection = "incoming",
  responsesRequired,
  errorMessages
}) => {

  let completed
  let errorMessage
  switch (true) {
    case isNodeSelectStep({ currentProgress }): {
      completed = nodeCount > 1
      if (!completed) errorMessage = errorMessages?.mustChooseTwoProblems
      break;
    };
    case isNodeClarificationStep({ currentProgress, showNodeClarificationStep }): {

      if (responsesRequired) {
        completed = nodes
          .filter(d => d.chosen && d.nodeClarification.length > 0)
          .every(v => v.nodeClarificationSelected.length > 0)

        if (!completed) errorMessage = errorMessages?.allQuestionsRequired
      } else completed = true
      break;
    }
    case isNodeRankingStep({ currentProgress, showNodeClarificationStep, showNodeRankingStep }): {
      if (responsesRequired) {
        completed = nodes.filter(d => d.chosen).every(v => typeof v.size == 'number')
        if (!completed) errorMessage = errorMessages?.allQuestionsRequired
      } else completed = true
      break;
    };
    case isLinkRankingIntroStep({ currentProgress, nodeCount, showNodeClarificationStep, showNodeRankingStep }): {
      completed = true
      break;
    }
    case isLinkRankingStep({ currentProgress, nodeCount, showNodeClarificationStep, showNodeRankingStep }): {
      if (responsesRequired) {
        let linksFiltered
        if (responseDirection == "incoming") {
          const selectedNodes = nodes.filter(d => d.chosen)
          const targetNode = selectedNodes[getLinkProgress({currentProgress, showNodeClarificationStep, showNodeRankingStep})]
          const sourceNodesIds = selectedNodes
            .filter(node => node.id != targetNode.id)
            .map(node => node.id)
          linksFiltered = links.filter(
            d => {
              return d.target.id == targetNode.id && sourceNodesIds.includes(d.source.id)
            }
          )
        } else {
          const selectedNodes = nodes.filter(d => d.chosen)
          const sourceNode = selectedNodes[getLinkProgress({currentProgress, showNodeClarificationStep, showNodeRankingStep}) ]
          const targetNodesIds = selectedNodes
            .filter(node => node.id != sourceNode.id)
            .map(node => node.id)
          linksFiltered = links.filter(
            d => {
              return d.source.id == sourceNode.id && targetNodesIds.includes(d.target.id)
            }
          )
        }
        completed = linksFiltered.length == nodeCount - 1
        if (!completed) errorMessage = errorMessages?.allQuestionsRequired
      } else completed = true
      break;
    }
    case isSubmitStep({ currentProgress, nodeCount, showNodeClarificationStep, showNodeRankingStep }): {
      completed = true
      break;
    }
  }
  const index = completedSteps.findIndex(d => d.id == currentProgress)
  if (index > -1) {
    return completedSteps.map((d, i) => {
      if (i === index) {
        return {
          ...d,
          completed,
          errorMessage
        }
      } else return d
    })
  } else {
    return [
      ...completedSteps,
      {
        id: currentProgress,
        completed,
        errorMessage
      }
    ]
  }
}

export {
  isNodeSelectStep,
  isNodeClarificationStep,
  isNodeRankingStep,
  isLinkRankingIntroStep,
  isLinkRankingStep,
  isSubmitStep,
  updateCompletedSteps,
  getLinkProgress,
  isFeedbackStep
}
