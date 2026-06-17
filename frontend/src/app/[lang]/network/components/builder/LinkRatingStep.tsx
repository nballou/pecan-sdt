import { useEffect, useRef, useCallback, useState, useMemo, memo } from "react";
import { Card, CardHeader, ScrollShadow, Divider } from "@heroui/react";
import LinkDirectionPicker from "./LinkDirectionPicker";
import Markdown from "markdown-to-jsx";
import { getLinkProgress } from "../utils/progress";
import useTrackDisplayTime from "../hooks/useTrackDisplayTime";
import CustomScrollShadow from "./CustomScrollShadow";
import { CONSTRUCT_COLORS } from "../utils/nodeColors";
import type { ScrollVisibility } from "@heroui/react";

// Helper function to create a consistent key for the map
const createLinkKey = (sourceId: string | number, targetId: string | number) => `${sourceId}->${targetId}`;

// Define props for LinkRatingItem (basic types)
interface LinkRatingItemProps {
  node: any;
  focusedNode: any;
  responseDirection: string;
  linksLookup: Map<string, { index: number; size: any }>;
  linkRankingStep: any;
  handleLinkSize: (args: any) => void;
  displayRequirementError: any;
  nodeColor: string;
}

const LinkRatingItem = memo(
  ({
    node,
    focusedNode,
    responseDirection,
    linksLookup,
    linkRankingStep,
    handleLinkSize,
    displayRequirementError,
    nodeColor,
  }: LinkRatingItemProps) => {
    const currentSourceNode =
      responseDirection === "incoming" ? node : focusedNode;
    const currentTargetNode =
      responseDirection === "incoming" ? focusedNode : node;

    const linkKey = createLinkKey(currentSourceNode.id, currentTargetNode.id);
    const linkInfo = linksLookup.get(linkKey);

    const linkIndex = linkInfo ? linkInfo.index : -1;
    const isTouched = linkInfo !== undefined;
    const currentLinkSize = linkInfo?.size;

    return (
      <LinkDirectionPicker
        key={`${focusedNode.id}-${node.id}-${currentLinkSize ?? 'null'}`}
        sourceNode={currentSourceNode}
        targetNode={currentTargetNode}
        linkSize={currentLinkSize ?? null}
        linkIndex={linkIndex}
        labels={linkRankingStep?.sliderLabels}
        handleChange={handleLinkSize}
        error={displayRequirementError}
        responseDirection={responseDirection}
        nodeColor={nodeColor}
      />
    );
  }
);
LinkRatingItem.displayName = "LinkRatingItem";

// Define props for LinkRatingStep (basic types)
interface LinkRatingStepProps {
    data: any;
    dispatch: (action: any) => void;
    onboarding: boolean;
    responseDirection: string;
    linkRankingStep: any;
    scrollIndicator: any;
}

const LinkRatingStep = ({
    data,
    dispatch,
    onboarding,
    responseDirection,
    linkRankingStep,
    scrollIndicator
}: LinkRatingStepProps) => {
  const {
    nodes,
    links,
    currentProgress,
    showNodeClarificationStep,
    showNodeRankingStep = true,
    displayRequirementError,
  } = data;

  const linkProgress = getLinkProgress({
    currentProgress,
    showNodeClarificationStep,
    showNodeRankingStep,
  });

  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    topRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [linkProgress]);

  const selectedNodes = useMemo(() => nodes.filter((d: any) => d.chosen), [nodes]);

  // Map node id → palette color based on position in full nodes list (consistent with graph)
  const nodeColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    nodes.forEach((node: any, i: number) => {
      map[node.id] = CONSTRUCT_COLORS[i % CONSTRUCT_COLORS.length]
    })
    return map
  }, [nodes])

  const linksLookup = useMemo(() => {
    const map = new Map<string, { index: number; size: any }>();
    links.forEach((link: any, index: number) => {
      const key = createLinkKey(link.source.id, link.target.id);
      map.set(key, { index, size: link.size });
    });
    return map;
  }, [links]);

  const handleLinkSize = useCallback(
    ({ value, target, source, index }: { value: any; target: any; source: any; index: number }) => {
      dispatch({
        type: "change_link_size",
        target,
        source,
        index,
        size: value,
      });
    },
    [dispatch]
  );
  useTrackDisplayTime(
    `${onboarding ? "onboarding-" : ""}linkRatingStep-${
      selectedNodes[linkProgress]?.nodeId
    }`
  );

  const focusedNode = selectedNodes[linkProgress];
  if (!focusedNode) return null;

  return (
    <Card className="linkRatingStep">
      <CardHeader className="flex flex-col items-start py-1 sm:py-3 gap-1">
        {linkRankingStep?.itemHeader && (
          <p className="text-sm text-gray-500 w-full">
            <Markdown children={linkRankingStep?.itemHeader} />
          </p>
        )}
        <h2 className="text-2xl font-bold leading-tight" style={{ color: nodeColorMap[focusedNode.id] }}>
          {focusedNode.label || focusedNode.name}
        </h2>
        {linkRankingStep?.focusedNodeSuffix && (
          <p className="text-sm text-gray-500">
            {linkRankingStep.focusedNodeSuffix}
          </p>
        )}
      </CardHeader>
      <Divider />
      <CustomScrollShadow
        ref={topRef}
        scrollIndicator={scrollIndicator}
      >
        {nodes
          .filter((node: any) => node.chosen && node.id !== focusedNode.id)
          .map((node: any) => (
            <LinkRatingItem
              key={node.id}
              node={node}
              focusedNode={focusedNode}
              responseDirection={responseDirection}
              linksLookup={linksLookup}
              linkRankingStep={linkRankingStep}
              handleLinkSize={handleLinkSize}
              displayRequirementError={displayRequirementError}
              nodeColor={nodeColorMap[node.id]}
            />
          ))}
      </CustomScrollShadow>
    </Card>
  );
};
export default LinkRatingStep;
