import { ComponentProps, JSX, useContext } from "solid-js";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { IThemeContext, ThemeContext } from "~/context/ThemeContext.tsx";

export interface DialogModalProps extends ComponentProps<"div"> {
  children?: JSX.Element;
  title?: string;
  trigger?: JSX.Element;
}

export function DialogModal(props: DialogModalProps) {
  const themeContext: IThemeContext = useContext(ThemeContext);

  return (
    <AlertDialog>
      <AlertDialogTrigger>{props.trigger || <Button>Open Dialog</Button>}</AlertDialogTrigger>
      <AlertDialogContent
        class={`dark:bg-blackout bg-primary text-100 dark:text-white ${themeContext.theme}`}
      >
        <AlertDialogTitle
          class={`font-bold text-100 underline underline-offset-2 light:text-black`}
        >
          {props.title}
        </AlertDialogTitle>
        <AlertDialogDescription>{props.children}</AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}
