import { JSX } from 'solid-js';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip.tsx';

export interface SimpleTooltipProps {
  children: JSX.Element;
  trigger: JSX.Element;
  className?: string;
}

export function SimpleTooltip(
  props: SimpleTooltipProps
) {
  return (
    <Tooltip>
      <TooltipTrigger class={props.className} onClick={(e) => e.stopPropagation()}>
        {props.trigger}
      </TooltipTrigger>
      <TooltipContent>
        {props.children}
      </TooltipContent>
    </Tooltip>
  )


}