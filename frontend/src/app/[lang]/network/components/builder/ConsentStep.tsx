"use client";

import { useState, useContext } from "react";
import { Button, Checkbox } from "@heroui/react";
import Markdown from "markdown-to-jsx";
import NetworkContext from "../reducer";

interface ConsentStatement {
  id: number;
  text: string;
  mandatory: boolean;
}

interface ConsentConfig {
  show: boolean;
  header?: string;
  body?: string;
  statements: ConsentStatement[];
}

const ConsentStep = ({ config }: { config: ConsentConfig }) => {
  const { state, dispatch } = useContext(NetworkContext);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const allChecked = config.statements.filter((s) => s.mandatory !== false).every((s) => checked[s.id]);

  const toggle = (id: number) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col w-full min-h-dvh">
      <div className="p-4 flex flex-col flex-grow w-full justify-center items-center">
        {config.header && (
          <h2 className="text-2xl font-bold">{config.header}</h2>
        )}
        {state.pid && (
          <p className="text-sm text-gray-500 mt-2">Your participant ID: <span className="font-mono font-semibold">{state.pid}</span></p>
        )}
        {config.body && (
          <div className="max-w-lg mx-auto rich-text py-6 prose-lg dark:bg-black dark:text-gray-50">
            <Markdown options={{ overrides: { a: { props: { target: '_blank', rel: 'noopener noreferrer' } } } }}>{config.body}</Markdown>
          </div>
        )}
        <div className="w-full max-w-lg space-y-4 py-4">
          {config.statements.map((statement) => (
            <Checkbox
              key={statement.id}
              isSelected={!!checked[statement.id]}
              onValueChange={() => toggle(statement.id)}
            >
              {statement.text}
              {statement.mandatory === false
                ? <span className="ml-1 text-xs text-gray-400">(optional)</span>
                : <span className="ml-1 text-red-500">*</span>
              }
            </Checkbox>
          ))}
        </div>
        <Button
          onPress={() => dispatch({ type: "set_consent_given" })}
          color="primary"
          size="lg"
          isDisabled={!allChecked}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ConsentStep;
