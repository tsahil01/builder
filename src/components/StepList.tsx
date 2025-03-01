import { Step } from "@/types/types";
import { CircleCheckBig, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useState } from "react";

interface StepsListProps {
    steps: Step[];
    currentStep: number;
    onStepClick: (stepId: number) => void;
}

export function StepList({ steps, currentStep, onStepClick }: StepsListProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="w-full p-3">
            <div className="w-full p-4 rounded-lg border border-zinc-800 bg-black/30 shadow-lg">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-200">Build Steps</h3>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-200"
                            >
                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <ul className="flex flex-col gap-2 mt-2">
                            {steps.map((step) => (
                                <Button
                                    key={step.id}
                                    className="gap-2 text-left justify-start hover:bg-gray-800 transition-colors duration-200"
                                    variant={"ghost"}
                                    size={"lg"}
                                    onClick={() => onStepClick(step.id)}
                                >
                                    {step.type === 0 && step.status === "completed" && <CircleCheckBig size={24} className="text-green-300" />}
                                    <span className={`text-sm ${step.type === 1 ? "text-gray-200 font-semibold" : "text-gray-400"}`}>
                                        {step.title}
                                    </span>
                                </Button>
                            ))}
                        </ul>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    );
}