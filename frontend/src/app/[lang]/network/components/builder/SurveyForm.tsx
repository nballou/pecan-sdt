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
}

interface SurveyConfig {
  show: boolean;
  header?: string;
  intro?: string;
  buttonSubmitLabel?: string;
  questions: SurveyQuestion[];
}

interface SurveyFormProps {
  config: SurveyConfig;
}

const SurveyForm = ({ config }: SurveyFormProps) => {
  const { dispatch } = useContext(NetworkContext);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const parseOptions = (optionsStr?: string): string[] => {
    if (!optionsStr) return [];
    // Support both newline and comma separators
    const separator = optionsStr.includes("\n") ? "\n" : ",";
    return optionsStr.split(separator).map((opt) => opt.trim()).filter((opt) => opt !== "");
  };

  const validateField = (question: SurveyQuestion, value: string | number): string | null => {
    if (question.required && (value === "" || value === undefined)) {
      return "This field is required";
    }

    if (question.fieldType === "number" && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return "Please enter a valid number";
      }
      if (question.min !== undefined && numValue < question.min) {
        return `Value must be at least ${question.min}`;
      }
      if (question.max !== undefined && numValue > question.max) {
        return `Value must be at most ${question.max}`;
      }
    }

    return null;
  };

  const handleChange = (questionId: string, value: string | number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error when user modifies field
    if (errors[questionId]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    config.questions.forEach((question) => {
      const value = responses[question.questionId];
      const error = validateField(question, value ?? "");
      if (error) {
        newErrors[question.questionId] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert number fields to actual numbers
    const processedResponses: Record<string, string | number> = {};
    config.questions.forEach((question) => {
      const value = responses[question.questionId];
      if (question.fieldType === "number" && value !== undefined && value !== "") {
        processedResponses[question.questionId] = Number(value);
      } else {
        processedResponses[question.questionId] = value;
      }
    });

    dispatch({
      type: "set_survey_responses",
      responses: processedResponses,
    });
  };

  const renderField = (question: SurveyQuestion) => {
    const commonProps = {
      label: question.label,
      placeholder: question.placeholder || "",
      isRequired: question.required,
      isInvalid: !!errors[question.questionId],
      errorMessage: errors[question.questionId],
      description: question.helpText,
    };

    switch (question.fieldType) {
      case "select": {
        const options = parseOptions(question.options);
        return (
          <Select
            {...commonProps}
            selectedKeys={responses[question.questionId] ? [String(responses[question.questionId])] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              if (selected !== undefined) {
                handleChange(question.questionId, String(selected));
              }
            }}
          >
            {options.map((option) => (
              <SelectItem key={option}>{option}</SelectItem>
            ))}
          </Select>
        );
      }

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            min={question.min}
            max={question.max}
            value={responses[question.questionId]?.toString() ?? ""}
            onValueChange={(value) => handleChange(question.questionId, value)}
          />
        );

      case "text":
      default:
        return (
          <Input
            {...commonProps}
            type="text"
            value={responses[question.questionId]?.toString() ?? ""}
            onValueChange={(value) => handleChange(question.questionId, value)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col w-full min-h-dvh">
      <div className="p-4 flex flex-col flex-grow w-full justify-center items-center">
        {config.header && (
          <h2 className="text-2xl font-bold">{config.header}</h2>
        )}
        {config.intro && (
          <div className="max-w-lg mx-auto rich-text py-6 prose-lg dark:bg-black dark:text-gray-50">
            <Markdown>{config.intro}</Markdown>
          </div>
        )}
        <div className="w-full max-w-lg space-y-6 py-4">
          {config.questions.map((question) => (
            <div key={question.id}>{renderField(question)}</div>
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
