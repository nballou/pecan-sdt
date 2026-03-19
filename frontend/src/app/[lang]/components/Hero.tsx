import Link from "next/link";
import Image from "next/image";
import HighlightedText from "./HighlightedText";
import { getStrapiMedia } from "../utils/api-helpers";
import { renderButtonStyle } from "../utils/render-button-style";
import DemoNetwork from "../network/components/feedback/DemoNetwork";
import { Button } from "@heroui/react";
import { FaEye } from "react-icons/fa";
import TargetNodeIncomingFeedbackDemo from "../network/components/feedback/TargetNodeIncomingFeedbackDemo";
interface Button {
  id: string;
  url: string;
  text: string;
  type: string;
  newTab: boolean;
}

interface Picture {
  data: {
    id: string;
    attributes: {
      url: string;
      name: string;
      alternativeText: string;
    };
  };
}

interface HeroProps {
  data: {
    id: string;
    title: string;
    description: string;
    picture: Picture;
    buttons: Button[];
  };
}


export default function Hero({ data }: HeroProps) {
  const imgUrl = getStrapiMedia(data.picture.data.attributes.url);

  const demoNetwork = {
    "nodes": [
      {
        "nodeId": "motivation",
        "label": "Motivation",
        "questionPrompt": "<strong>Motivation</strong> leads to ...",
        "causePrompt": "... Motivation",
        "id": 1,
        "name": "Motivation",
        "chosen": true,
        "size": 65,
        "index": 0,
        "x": 0,
        "y": -80
      },
      {
        "nodeId": "behavior",
        "label": "Behavior",
        "questionPrompt": "<strong>Behavior</strong> leads to ...",
        "causePrompt": "... Behavior",
        "id": 2,
        "name": "Behavior",
        "chosen": true,
        "size": 60,
        "index": 1,
        "x": -120,
        "y": 40
      },
      {
        "nodeId": "wellbeing",
        "label": "Wellbeing",
        "questionPrompt": "<strong>Wellbeing</strong> leads to ...",
        "causePrompt": "... Wellbeing",
        "id": 3,
        "name": "Wellbeing",
        "chosen": true,
        "size": 62,
        "index": 2,
        "x": 120,
        "y": 40
      },
      {
        "nodeId": "performance",
        "label": "Performance",
        "questionPrompt": "<strong>Performance</strong> leads to ...",
        "causePrompt": "... Performance",
        "id": 4,
        "name": "Performance",
        "chosen": true,
        "size": 58,
        "index": 3,
        "x": -80,
        "y": 120
      },
      {
        "nodeId": "satisfaction",
        "label": "Satisfaction",
        "questionPrompt": "<strong>Satisfaction</strong> leads to ...",
        "causePrompt": "... Satisfaction",
        "id": 5,
        "name": "Satisfaction",
        "chosen": true,
        "size": 60,
        "index": 4,
        "x": 80,
        "y": 120
      }
    ],
    "nodeCount": 5,
    "links": [
      {
        "target": { "nodeId": "behavior", "id": 2 },
        "source": { "nodeId": "motivation", "id": 1 },
        "size": 85,
        "display": true,
        "index": 0
      },
      {
        "target": { "nodeId": "wellbeing", "id": 3 },
        "source": { "nodeId": "motivation", "id": 1 },
        "size": 70,
        "display": true,
        "index": 1
      },
      {
        "target": { "nodeId": "performance", "id": 4 },
        "source": { "nodeId": "behavior", "id": 2 },
        "size": 80,
        "display": true,
        "index": 2
      },
      {
        "target": { "nodeId": "satisfaction", "id": 5 },
        "source": { "nodeId": "wellbeing", "id": 3 },
        "size": 75,
        "display": true,
        "index": 3
      },
      {
        "target": { "nodeId": "satisfaction", "id": 5 },
        "source": { "nodeId": "performance", "id": 4 },
        "size": 65,
        "display": true,
        "index": 4
      },
      {
        "target": { "nodeId": "motivation", "id": 1 },
        "source": { "nodeId": "satisfaction", "id": 5 },
        "size": 72,
        "display": true,
        "index": 5
      },
      {
        "target": { "nodeId": "wellbeing", "id": 3 },
        "source": { "nodeId": "satisfaction", "id": 5 },
        "size": 68,
        "display": true,
        "index": 6
      },
      {
        "target": { "nodeId": "motivation", "id": 1 },
        "source": { "nodeId": "wellbeing", "id": 3 },
        "size": 60,
        "display": true,
        "index": 7
      }
    ],
    "linkCount": 8,
    "responseDirection": "outgoing",
    "locale": "en",
    "highlightNode": []
  }

  return (
    <section className="dark:bg-black dark:text-gray-100">
      <div className="container flex flex-col justify-center items-center p-6 mx-auto sm:py-12 lg:py-24 lg:flex-row lg:justify-between">
        <div className="flex flex-col justify-center p-6 text-center rounded-lg lg:max-w-md xl:max-w-lg lg:text-left">
          <HighlightedText
            text={data.title}
            tag="h1"
            className="text-5xl font-bold leading-none sm:text-6xl mb-8"
            color="dark:text-violet-400"
          />

          <HighlightedText
            text={data.description}
            tag="p"
            className="tmt-6 mb-8 text-lg sm:mb-12"
            color="dark:text-violet-400"
          />
          <div className="flex flex-col space-y-4 sm:items-center sm:justify-center sm:flex-row sm:space-y-0 sm:space-x-4 lg:justify-start">
            {data.buttons.map((button: Button, index: number) => (
              <Button
                key={index}
                href={button.url}
                target={button.newTab ? "_blank" : "_self"}
                size="lg"
                as={Link}
                color={button.type}
              >
                {button.text}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-6 mt-8 lg:mt-0 h-72 sm:h-[24rem] lg:h-[32rem] w-full" >
          {/* <Image
            src={imgUrl || ""}
            alt={
              data.picture.data.attributes.alternativeText || "none provided"
            }
            className="object-contain h-72 sm:h-80 lg:h-96 xl:h-112 2xl:h-128 "
            width={600}
            height={600}
          /> */}
          <TargetNodeIncomingFeedbackDemo data={demoNetwork} targetId={1}/>
        </div>
      </div>
    </section>
  );
}
