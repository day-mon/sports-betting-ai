import { ComponentProps, JSX } from 'solid-js';
import { Motion } from 'solid-motionone';
import { Easing, EasingGenerator, EasingFunction } from '@motionone/types'

export interface AnimationDivProps extends ComponentProps<'div'>{
  children?: JSX.Element;
  easing?: EasingGenerator | Easing | Easing[] | EasingFunction
  duration?: number;
}


export function AnimationDiv(
  props: AnimationDivProps
) {
  return (
    <Motion.div
      animate={{ opacity: [0, 1] }}
      transition={{ duration: props.duration || 1, easing: props.easing || 'ease-in-out' }}
      {...props}
    >
      {props.children}
    </Motion.div>
  );
}