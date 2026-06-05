"use client";

import { useState, useContext } from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import Markdown from "markdown-to-jsx";
import NetworkContext from "../reducer";

interface SurveyQuestion {
  id: number;
  questionId: string;
  label: string;
  fieldType: "text" | "number" | "select";
  placeholder?: string;
  required: boolean;
  options?: string;
  min?: number;
  max?: number;
  helpText?: string;
  multiSelect?: boolean;
  allowOther?: boolean;
}

interface SurveyConfig {
  show: boolean;
  header?: string;
  intro?: string;
  buttonSubmitLabel?: string;
  questions: SurveyQuestion[];
}

type ResponseValue = string | number | string[];

const SurveyForm = ({ config }: { config: SurveyConfig }) => {
  const { dispatch } = useContext(NetworkContext);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const parseOptions = (optionsStr?: string): string[] => {
    if (!optionsStr) return [];
    const separator = optionsStr.includes("\n") ? "\n" : ",";
    return optionsStr.split(separator).map((o) => o.trim()).filter(Boolean);
  };

  const handleChange = (questionId: string, value: ResponseValue) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => { const u = { ...prev }; delete u[questionId]; return u; });
    }
  };

  const validateField = (q: SurveyQuestion): string | null => {
    if (!q.required) return null;
    const value = responses[q.questionId];
    if (q.fieldType === "select" && q.multiSelect) {
      if (!Array.isArray(value) || value.length === 0) return "Please select at least one option";
    } else if (value === "" || value === undefined) {
      return "This field is required";
    }
    if (q.fieldType === "number" && value !== "") {
      const n = Number(value);
      if (isNaN(n)) return "Please enter a valid number";
      if (q.min !== undefined && n < q.min) return `Value must be at least ${q.min}`;
      if (q.max !== undefined && n > q.max) return `Value must be at most ${q.max}`;
    }
    return null;
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    config.questions.forEach((q) => {
      const err = validateField(q);
      if (err) newErrors[q.questionId] = err;
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const processed: Record<string, ResponseValue> = {};
    config.questions.forEach((q) => {
      const value = responses[q.questionId];
      if (q.fieldType === "select") {
        const otherText = (responses[`${q.questionId}_other`] ?? "") as string;
        if (q.multiSelect) {
          const arr = (Array.isArray(value) ? value : []) as string[];
          processed[q.questionId] = arr.map((v) =>
            v === "Other" && otherText ? `Other: ${otherText}` : v
          );
        } else {
          processed[q.questionId] =
            value === "Other" && otherText ? `Other: ${otherText}` : value ?? "";
        }
      } else if (q.fieldType === "number" && value !== undefined && value !== "") {
        processed[q.questionId] = Number(value);
      } else {
        processed[q.questionId] = value ?? "";
      }
    });

    dispatch({ type: "set_survey_responses", responses: processed });
  };

  const renderField = (q: SurveyQuestion) => {
    const commonProps = {
      label: q.label,
      placeholder: q.placeholder || "",
      isRequired: q.required,
      isInvalid: !!errors[q.questionId],
      errorMessage: errors[q.questionId],
      description: q.helpText,
    };

    switch (q.fieldType) {
      case "select": {
        const opts = parseOptions(q.options);
        const allOpts = q.allowOther ? [...opts, "Other"] : opts;

        if (q.multiSelect) {
          const selected = (responses[q.questionId] as string[]) ?? [];
          const showOther = q.allowOther && selected.includes("Other");
          return (
            <div className="space-y-2">
              <Select
                {...commonProps}
                selectionMode="multiple"
                selectedKeys={new Set(selected)}
                onSelectionChange={(keys) => handleChange(q.questionId, Array.from(keys) as string[])}
              >
                {allOpts.map((o) => <SelectItem key={o}>{o}</SelectItem>)}
              </Select>
              {showOther && (
                <Input
                  placeholder="Please specify..."
                  value={(responses[`${q.questionId}_other`] ?? "") as string}
                  onValueChange={(v) => handleChange(`${q.questionId}_other`, v)}
                />
              )}
            </div>
          );
        }

        const value = (responses[q.questionId] ?? "") as string;
        const showOther = q.allowOther && value === "Other";
        return (
          <div className="space-y-2">
            <Select
              {...commonProps}
              selectedKeys={value ? [value] : []}
              onSelectionChange={(keys) => {
                const sel = Array.from(keys)[0];
                if (sel !== undefined) handleChange(q.questionId, String(sel));
              }}
            >
              {allOpts.map((o) => <SelectItem key={o}>{o}</SelectItem>)}
            </Select>
            {showOther && (
              <Input
                placeholder="Please specify..."
                value={(responses[`${q.questionId}_other`] ?? "") as string}
                onValueChange={(v) => handleChange(`${q.questionId}_other`, v)}
              />
            )}
          </div>
        );
      }

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            min={q.min}
            max={q.max}
            value={(responses[q.questionId] ?? "").toString()}
            onValueChange={(v) => handleChange(q.questionId, v)}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
            value={(responses[q.questionId] ?? "").toString()}
            onValueChange={(v) => handleChange(q.questionId, v)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col w-full min-h-dvh">
      <div className="p-4 flex flex-col flex-grow w-full justify-center items-center">
        {config.header && <h2 className="text-2xl font-bold">{config.header}</h2>}
        {config.intro && (
          <div className="max-w-lg mx-auto rich-text py-6 prose-lg dark:bg-black dark:text-gray-50">
            <Markdown>{config.intro}</Markdown>
          </div>
        )}
        <div className="w-full max-w-lg space-y-6 py-4">
          {config.questions.map((q) => (
            <div key={q.id}>{renderField(q)}</div>
          ))}
        </div>
        <Button onPress={handleSubmit} color="primary" size="lg">
          {config.buttonSubmitLabel || "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default SurveyForm;
