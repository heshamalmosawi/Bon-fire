import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import React, { ReactNode } from "react";

interface ToolTipWrapperProps {
  children: ReactNode;
  text: string;
}
/**
 * This wraps a react component (intrinsic or custom) to allow a tooltip to be
 * displayed on hover
 * 
 * @param props text + the child component
 */
const ToolTipWrapper = (props: ToolTipWrapperProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{props.children}</TooltipTrigger>
        <TooltipContent>
          <p>{props.text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolTipWrapper;
